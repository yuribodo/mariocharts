import { render, screen } from "@testing-library/react";

import { AgentReadySection } from "./agent-ready-section";
import { AGENT_READY_HEADLINE, AGENT_READY_PROMPT } from "./agent-ready-content";

describe("AgentReadySection", () => {
  it("leads with the agent-ready belief", () => {
    render(<AgentReadySection />);

    expect(
      screen.getByRole("heading", { name: AGENT_READY_HEADLINE }),
    ).toBeInTheDocument();
    expect(screen.getByText("Built for agents")).toBeInTheDocument();
    expect(
      screen.getByText("Copy-paste, not a black box"),
    ).toBeInTheDocument();
    expect(screen.getByText("Plain React + Tailwind")).toBeInTheDocument();
    expect(screen.getByText("Typed props")).toBeInTheDocument();
  });

  it("exposes a copyable agent prompt", () => {
    render(<AgentReadySection />);

    expect(screen.getByText(AGENT_READY_PROMPT)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy prompt" }),
    ).toBeInTheDocument();
  });

  it("stays flat — no floating card chrome", () => {
    const { container } = render(<AgentReadySection />);
    const markup = container.innerHTML;

    expect(markup).not.toContain("rounded-xl");
    expect(markup).not.toContain("rounded-2xl");
    expect(markup).not.toContain("backdrop-blur");
    expect(markup).not.toContain("shadow-lg");
  });
});
