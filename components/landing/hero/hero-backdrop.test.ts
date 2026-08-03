import {
  BACKDROP_COLUMNS,
  BACKDROP_ROWS,
  CHART_ROWS,
  HERO_BACKDROP,
  HERO_BACKDROP_CHART,
  backdropFrame,
  chartFrame,
  sampleBackdropGlyph,
  warpBackdropFrame,
} from "./hero-backdrop";

describe("backdropFrame", () => {
  it("makes frame 0 the committed baseline, so hydration sees the server's characters", () => {
    expect(backdropFrame(0)).toBe(HERO_BACKDROP);
  });

  it("is deterministic per time and actually moves between times", () => {
    expect(backdropFrame(7)).toBe(backdropFrame(7));
    expect(backdropFrame(7)).not.toBe(backdropFrame(0));
    // Continuous time must glide — a half-tick is a real distinct frame, not
    // snapped to an integer floor the way the old twinkle step was.
    expect(backdropFrame(0.5)).not.toBe(backdropFrame(0));
    expect(backdropFrame(0.5)).not.toBe(backdropFrame(1));
  });

  it("keeps the copy's clearing empty in every frame, not just the first", () => {
    // The clearing is what lets the headline sit on the field with no scrim.
    // An animation that leaked glyphs into it would make the copy illegible
    // only at runtime, where no static check would ever see it.
    const centreX = Math.floor(BACKDROP_COLUMNS * 0.2);
    const centreY = Math.floor(BACKDROP_ROWS * 0.5);

    for (const t of [0, 0.5, 3, 8, 21]) {
      const row = backdropFrame(t).split("\n")[centreY] ?? "";
      expect(row.charAt(centreX) || " ").toBe(" ");
    }
  });

  it("thins the field under the portrait without carving a hard empty plate", () => {
    // Average ink in the well's centre versus a band above the well (same
    // x, outside the soft rect). The well must be quieter; emptying it
    // entirely would read as a scrim, so it must still carry some ink.
    const ramp = " .:-=+";
    const averageInk = (t: number, x0: number, x1: number, y0: number, y1: number) => {
      const rows = backdropFrame(t).split("\n");
      let sum = 0;
      let n = 0;
      for (let y = y0; y < y1; y += 1) {
        const row = rows[y] ?? "";
        for (let x = x0; x < x1; x += 1) {
          sum += Math.max(0, ramp.indexOf(row.charAt(x) || " "));
          n += 1;
        }
      }
      return sum / n;
    };

    const well = averageInk(
      0,
      Math.floor(BACKDROP_COLUMNS * 0.7),
      Math.floor(BACKDROP_COLUMNS * 0.9),
      Math.floor(BACKDROP_ROWS * 0.4),
      Math.floor(BACKDROP_ROWS * 0.6),
    );
    const outside = averageInk(
      0,
      Math.floor(BACKDROP_COLUMNS * 0.7),
      Math.floor(BACKDROP_COLUMNS * 0.9),
      0,
      Math.floor(BACKDROP_ROWS * 0.08),
    );

    expect(well).toBeLessThan(outside * 0.6);
    expect(well).toBeGreaterThan(0);
  });
});

describe("warpBackdropFrame", () => {
  it("is deterministic and settles toward the normal field as progress reaches 1", () => {
    expect(warpBackdropFrame(0.3, 2)).toBe(warpBackdropFrame(0.3, 2));
    expect(warpBackdropFrame(0, 0)).not.toBe(warpBackdropFrame(1, 0));
    // Fully settled warp at t=0 matches sampling the ordinary field cell-wise
    // at the same time — progress 1 means zoom 1 and full clearance.
    const settled = warpBackdropFrame(1, 0);
    expect(settled).toBe(backdropFrame(0));
  });

  it("keeps the copy clearing closed early and open late", () => {
    const inkInClearing = (frame: string) => {
      const rows = frame.split("\n");
      let ink = 0;
      let n = 0;
      for (let y = Math.floor(BACKDROP_ROWS * 0.35); y < Math.floor(BACKDROP_ROWS * 0.65); y += 1) {
        const row = rows[y] ?? "";
        for (let x = Math.floor(BACKDROP_COLUMNS * 0.1); x < Math.floor(BACKDROP_COLUMNS * 0.35); x += 1) {
          if ((row.charAt(x) || " ") !== " ") ink += 1;
          n += 1;
        }
      }
      return ink / n;
    };

    // Early tunnel still has texture where the headline will sit; settled
    // frame has carved that clearing empty.
    expect(inkInClearing(warpBackdropFrame(0.1, 0))).toBeGreaterThan(0.05);
    expect(inkInClearing(warpBackdropFrame(1, 0))).toBe(0);
  });
});

describe("sampleBackdropGlyph", () => {
  it("respects clearanceMix so the entrance can hold a solid tunnel wall", () => {
    const x = Math.floor(BACKDROP_COLUMNS * 0.2);
    const y = Math.floor(BACKDROP_ROWS * 0.5);
    const walled = sampleBackdropGlyph(x, y, 0, 0);
    const cleared = sampleBackdropGlyph(x, y, 0, 1);
    expect(cleared).toBe(" ");
    expect(walled).not.toBe(" ");
  });
});

describe("chartFrame", () => {
  it("makes frame 0 the committed baseline", () => {
    expect(chartFrame(0)).toBe(HERO_BACKDROP_CHART);
  });

  it("holds the data's surface line still while the wash flickers", () => {
    // The flicker is texture; the curve is data. If the surface moved with
    // time the hero would be animating its numbers, which is a lie.
    const topmostInk = (frame: string, column: number) => {
      const rows = frame.split("\n");
      for (let y = 0; y < rows.length; y += 1) {
        if (((rows[y] ?? "").charAt(column) || " ") !== " ") return y;
      }
      return -1;
    };

    const later = chartFrame(9.5);
    for (const column of [10, 60, 120, 180, BACKDROP_COLUMNS - 5]) {
      const baseline = topmostInk(HERO_BACKDROP_CHART, column);
      expect(baseline).toBeGreaterThan(-1);
      expect(baseline).toBeLessThan(CHART_ROWS);
      expect(topmostInk(later, column)).toBe(baseline);
    }
  });
});
