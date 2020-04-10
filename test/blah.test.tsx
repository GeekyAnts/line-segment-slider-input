import * as React from "react";
import * as ReactDOM from "react-dom";
import LineSegmentSliderInput from "../src/index";

describe("it", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LineSegmentSliderInput
        x={0}
        y={0}
        width={500}
        height={500}
        from={[0.2, 0.2]}
        to={[0.8, 0.8]}
        stops={[
          {
            position: 0,
            color: "white",
          },
          {
            position: 0.2,
            color: "white",
          },
          {
            position: 1,
            color: "white",
          },
        ]}
        index={-1}
        zoom={1}
        scroll={{ x: 0, y: 0 }}
        // @ts-ignore
        changeIndex={(index: number) => null}
        handleMove={(
          // @ts-ignore
          type: string,
          // @ts-ignore
          handle:
            | Array<number>
            | Array<{
                position: number;
                color: string;
              }>
        ) => null}
        removeHandle={() => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
