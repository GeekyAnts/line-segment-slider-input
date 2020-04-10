import "react-app-polyfill/ie11";
import * as React from "react";
import * as ReactDOM from "react-dom";
import LineSegmentSliderInput from "../src/index";

type Stop = {
  position: number;
  color: string;
};

type StateType = {
  from: Array<number>;
  to: Array<number>;
  stops: Array<Stop>;
  index: number;
};
class App extends React.Component<{}, StateType> {
  constructor(props) {
    super(props);

    this.state = {
      from: [0.0, 0.0],
      to: [1, 1],
      index: -1,
      stops: [
        {
          position: 0,
          color: "red",
        },
        {
          position: 0.2,
          color: "blue",
        },
        {
          position: 1,
          color: "green",
        },
      ],
    };
  }

  handleMove(type, handle) {
    if (type === "from") {
      this.setState({ from: handle });
    } else if (type === "to") {
      this.setState({ to: handle });
    } else {
      this.setState({ stops: handle });
    }
  }

  removeHandle() {
    if (this.state.index) {
      let stops = this.state.stops;

      if (!(this.state.index === 0 || this.state.index === stops.length - 1)) {
        stops.splice(this.state.index, 1);
      }

      this.setState({ stops });
    }
  }

  changeIndex(index) {
    this.setState({ index });
  }

  render() {
    return (
      <div
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: "absolute",
        }}
      >
        <LineSegmentSliderInput
          x={20}
          y={20}
          width={500}
          height={500}
          zoom={1}
          scroll={{ x: 0, y: 0 }}
          from={this.state.from}
          to={this.state.to}
          stops={this.state.stops}
          index={this.state.index}
          changeIndex={this.changeIndex.bind(this)}
          handleMove={this.handleMove.bind(this)}
          removeHandle={this.removeHandle.bind(this)}
          onClickOutside={(e: any) => {
            console.log("clicked outside", e);
          }}
          onWrapperMouseDown={(e: any) => {
            console.log("mouse down", e);
          }}
          onWrapperMouseUp={(e: any) => {
            console.log("mouse up", e);
          }}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
