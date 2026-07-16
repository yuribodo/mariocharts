import { render, screen } from "@testing-library/react";
import { DollarSign } from "lucide-react";
import {
  DashboardPanel,
  DashboardSection,
  MetricCell,
} from "./dashboard-primitives";

describe("dashboard primitives", () => {
  it("renders question-driven sections and panels", () => {
    render(
      <DashboardSection title="Revenue" description="Where growth comes from">
        <DashboardPanel question="Which product leads?" insight="Cloud grew 18%">
          <div>Chart</div>
        </DashboardPanel>
      </DashboardSection>,
    );

    expect(screen.getByRole("heading", { name: "Revenue" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Which product leads?" })).toBeInTheDocument();
    expect(screen.getByText("Cloud grew 18%")).toBeInTheDocument();
  });

  it("presents metric movement without a decorative badge", () => {
    const { container } = render(
      <MetricCell
        label="Revenue"
        value="$1.2M"
        previousValue="$1.0M"
        change={12.5}
        context="Best month this quarter"
        icon={DollarSign}
      />,
    );

    expect(screen.getByText("12.5% increase")).toBeInTheDocument();
    expect(screen.getByText("$1.2M")).toHaveClass("tabular-nums");
    expect(container.querySelector(".shadow-sm")).not.toBeInTheDocument();
  });
});
