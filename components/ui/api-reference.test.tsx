import { render, screen } from "@testing-library/react";
import { APIReference } from "./api-reference";

describe("APIReference", () => {
  it("renders an accessible, horizontally scrollable prop table", () => {
    render(
      <APIReference
        description="Public component contract."
        props={[
          { name: "data", type: "readonly T[]", description: "Chart data.", required: true },
          { name: "height", type: "number", default: "300", description: "Chart height." },
        ]}
      />,
    );

    expect(screen.getByRole("table", { name: "Component props" })).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
  });
});
