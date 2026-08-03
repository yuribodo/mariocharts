import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { AgentReadySection } from "./agent-ready-section";
import { AGENT_READY_HEADLINE, AGENT_READY_PROMPT } from "./agent-ready-content";

jest.mock("framer-motion", () => {
  function MotionDiv({
    children,
    className,
  }: {
    children?: ReactNode;
    className?: string;
  }) {
    return <div className={className}>{children}</div>;
  }
  function MotionP({
    children,
    className,
  }: {
    children?: ReactNode;
    className?: string;
  }) {
    return <p className={className}>{children}</p>;
  }
  function MotionH2({
    children,
    className,
    id,
  }: {
    children?: ReactNode;
    className?: string;
    id?: string;
  }) {
    return (
      <h2 id={id} className={className}>
        {children}
      </h2>
    );
  }
  function MotionUl({
    children,
    className,
  }: {
    children?: ReactNode;
    className?: string;
  }) {
    return <ul className={className}>{children}</ul>;
  }
  function MotionLi({
    children,
    className,
  }: {
    children?: ReactNode;
    className?: string;
  }) {
    return <li className={className}>{children}</li>;
  }

  return {
    useReducedMotion: () => false,
    motion: {
      div: MotionDiv,
      p: MotionP,
      h2: MotionH2,
      ul: MotionUl,
      li: MotionLi,
    },
  };
});

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

  it("pins the belief on large screens", () => {
    const { container } = render(<AgentReadySection />);
    const markup = container.innerHTML;

    expect(markup).toContain("lg:sticky");
    expect(markup).toContain("lg:top-14");
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
