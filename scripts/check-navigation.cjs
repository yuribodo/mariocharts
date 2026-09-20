/* Browser regression checks. See docs/research/2026-09-12-chart-quality/navigation-fixes.md. */
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node script; NODE_PATH supports an isolated Playwright install. */
const assert = require("node:assert/strict");
const { mkdir } = require("node:fs/promises");
const { chromium } = require("playwright-core");

const origin = process.env.SITE_URL || "http://localhost:3100";
const artifacts = process.env.ARTIFACT_DIR || "/tmp/mariocharts-navigation";

async function main() {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    args: ["--no-sandbox"],
  });
  try {
    await mkdir(artifacts, { recursive: true });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("https://api.github.com/**", (route) =>
      route.fulfill({ json: { stargazers_count: 123 } }),
    );
    await page.addInitScript(() => {
      window.navigationFrames = [];
      window.navigationShifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.navigationShifts.push({
            value: entry.value,
            recentInput: entry.hadRecentInput,
            time: entry.startTime,
          });
        }
      }).observe({ type: "layout-shift", buffered: true });
      const record = () => {
        const nav = document.querySelector(
          'nav[aria-label="Primary navigation"]',
        );
        const indicator = nav?.querySelector("[data-nav-indicator]");
        const active = nav?.querySelector("[aria-current]");
        const main = document.querySelector("main main");
        const sidebar = document.querySelector("aside");
        if (main && indicator) {
          window.navigationFrames.push({
            time: performance.now(),
            path: location.pathname,
            heading: main.querySelector("h1")?.textContent,
            height: main.offsetHeight,
            x: main.getBoundingClientRect().x,
            width: main.getBoundingClientRect().width,
            sidebarX: sidebar?.getBoundingClientRect().x,
            sidebarScroll: sidebar?.firstElementChild?.scrollTop,
            indicator: indicator.getBoundingClientRect().toJSON(),
            active: active?.getBoundingClientRect().toJSON(),
            toc: [...document.querySelectorAll("aside:last-of-type li a")]
              .map((a) => a.textContent)
              .join("|"),
          });
        }
        requestAnimationFrame(record);
      };
      requestAnimationFrame(record);
    });
    const primary = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    const reset = () =>
      page.evaluate(() => {
        window.navigationFrames = [];
        window.navigationShifts = [];
      });
    const settled = async () => {
      await page.waitForTimeout(500);
      await page.evaluate(() => document.fonts.ready);
    };
    const assertIndicator = async () => {
      const result = await primary.evaluate((nav) => {
        const active = nav.querySelector("[aria-current]");
        const indicator = nav.querySelector("[data-nav-indicator]");
        const rect = indicator.getBoundingClientRect();
        const target = active.getBoundingClientRect();
        const padding = getComputedStyle(active);
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          targetX: target.x + parseFloat(padding.paddingLeft),
          targetWidth:
            target.width -
            parseFloat(padding.paddingLeft) -
            parseFloat(padding.paddingRight),
          bottom: target.bottom,
        };
      });
      assert.ok(
        Math.abs(result.x - result.targetX) < 1,
        JSON.stringify(result),
      );
      assert.ok(
        Math.abs(result.width - result.targetWidth) < 1,
        JSON.stringify(result),
      );
      assert.ok(
        Math.abs(result.y - (result.bottom - 0.5)) < 1,
        JSON.stringify(result),
      );
    };

    // Pause JS to compare server fallback geometry against highlighted code.
    let releaseScripts;
    const scriptsReady = new Promise((resolve) => {
      releaseScripts = resolve;
    });
    await page.route("**/*.js", async (route) => {
      await scriptsReady;
      await route.continue();
    });
    await page.goto(`${origin}/docs/components/line-chart`, {
      waitUntil: "commit",
    });
    await page.locator("main main pre").first().waitFor();
    const fallback = await page
      .locator("main main pre")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().height),
      );
    releaseScripts();
    await page.waitForSelector(".shiki-themed .line");
    await settled();
    const highlighted = await page
      .locator("main main pre")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().height),
      );
    assert.deepEqual(
      highlighted,
      fallback,
      "Syntax highlighting must preserve fallback height",
    );
    await page.unroute("**/*.js");
    console.log("PASS: cold-load code geometry", highlighted);

    const routes = [
      "bar-chart",
      "line-chart",
      "scatter-plot",
      "pie-chart",
      "radar-chart",
      "stacked-bar-chart",
      "gauge-chart",
      "heatmap",
      "funnel-chart",
      "treemap",
      "waterfall-chart",
      "sankey-chart",
    ];
    for (const slug of routes) {
      const path = `/docs/components/${slug}`;
      if (routes.indexOf(slug) % 2 === 1) {
        await page.evaluate(() => scrollTo(0, 1000));
      }
      await reset();
      await page.locator("aside").first().locator(`a[href="${path}"]`).click();
      await page.waitForURL(`${origin}${path}`);
      await settled();
      assert.equal(
        await page.evaluate(() => scrollY),
        0,
        `${slug}: scroll restoration`,
      );
      const codeSizes = await page
        .locator("main main pre")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const plain = node.cloneNode(true);
            const code = plain.querySelector("code");
            code.replaceChildren(document.createTextNode(code.textContent));
            node.after(plain);
            const sizes = {
              highlighted: node.offsetHeight,
              plain: plain.offsetHeight,
            };
            plain.remove();
            return sizes;
          }),
        );
      for (const size of codeSizes) {
        assert.equal(
          size.highlighted,
          size.plain,
          `${slug}: code line spacing`,
        );
      }
      const frames = await page.evaluate(() => window.navigationFrames);
      const last = frames.at(-1);
      const committed = frames.filter(
        (frame) => frame.path === last.path && frame.heading === last.heading,
      );
      for (const frame of committed) {
        assert.equal(
          frame.height,
          last.height,
          `${slug}: content height changed after route commit`,
        );
        assert.equal(frame.x, last.x, `${slug}: content moved horizontally`);
        assert.equal(frame.width, last.width, `${slug}: content width changed`);
        assert.equal(frame.sidebarX, last.sidebarX, `${slug}: sidebar moved`);
        assert.equal(
          frame.sidebarScroll,
          last.sidebarScroll,
          `${slug}: sidebar lost scroll position`,
        );
        assert.equal(frame.toc, last.toc, `${slug}: delayed table of contents`);
      }
      const cls = await page.evaluate(
        (firstPaint) =>
          window.navigationShifts
            .filter(
              (entry) => !entry.recentInput && entry.time > firstPaint + 20,
            )
            .reduce((sum, entry) => sum + entry.value, 0),
        committed[0].time,
      );
      assert.equal(cls, 0, `${slug}: unexpected layout shift`);
      await assertIndicator();
      console.log(
        `PASS: sidebar ${slug} (${committed.length} frames, post-navigation CLS ${cls})`,
      );
    }

    // The underline used to jump over 1,000px vertically on this transition.
    await page.evaluate(() => scrollTo(0, 1400));
    await reset();
    await primary.getByRole("link", { name: "Docs", exact: true }).click();
    await page.waitForURL(`${origin}/docs`);
    await settled();
    const frames = await page.evaluate(() => window.navigationFrames);
    for (const frame of frames) {
      assert.ok(
        frame.indicator.y >= 0 && frame.indicator.y < 57,
        `Indicator escaped header: ${frame.indicator.y}`,
      );
    }
    await assertIndicator();
    console.log("PASS: scrolled navbar transition remains inside header");

    const gettingStarted = page
      .locator("aside")
      .first()
      .getByRole("button", { name: "Getting Started" });
    if ((await gettingStarted.getAttribute("aria-expanded")) !== "true")
      await gettingStarted.click();
    for (const path of ["/docs/installation", "/docs/ai-agents"]) {
      await page.locator("aside").first().locator(`a[href="${path}"]`).click();
      await page.waitForURL(`${origin}${path}`);
      await settled();
      assert.equal(
        await primary
          .getByRole("link", { name: "Docs", exact: true })
          .getAttribute("aria-current"),
        "page",
      );
      await assertIndicator();
    }
    await primary.getByRole("link", { name: "Charts", exact: true }).focus();
    await page.keyboard.press("Enter");
    await page.waitForURL(`${origin}/docs/components`);
    await settled();
    assert.equal(
      await primary
        .locator("[data-nav-indicator]")
        .evaluate((el) => getComputedStyle(el).transitionProperty),
      "none",
    );
    for (const name of ["Examples", "Docs", "Charts"]) {
      await primary.getByRole("link", { name, exact: true }).click();
      await page.waitForTimeout(70);
    }
    await settled();
    await assertIndicator();
    await page.goBack();
    await settled();
    await assertIndicator();
    await page.goForward();
    await settled();
    await assertIndicator();
    console.log("PASS: Docs subroutes, keyboard, rapid tabs, back and forward");

    for (const width of [1024, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await settled();
      await assertIndicator();
    }
    await page.screenshot({ path: `${artifacts}/desktop.png` });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await primary.getByRole("link", { name: "Docs", exact: true }).click();
    await settled();
    await assertIndicator();
    assert.equal(
      await primary
        .locator("[data-nav-indicator]")
        .evaluate((el) => getComputedStyle(el).transitionProperty),
      "none",
    );
    console.log("PASS: responsive underline and reduced motion");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Line Chart", exact: true })
      .click();
    await page.waitForURL(`${origin}/docs/components/line-chart`);
    await settled();
    assert.equal(await page.getByRole("dialog").count(), 0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(
      overflow,
      false,
      "Mobile navigation introduced horizontal overflow",
    );
    await page.screenshot({ path: `${artifacts}/mobile.png` });
    console.log("PASS: mobile drawer navigation");
    assert.deepEqual(errors, [], "Browser runtime errors");
    console.log(`All navigation checks passed. Screenshots: ${artifacts}`);
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
