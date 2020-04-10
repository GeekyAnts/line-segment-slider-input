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
      from: [0.2, 0.2],
      to: [0.8, 0.8],
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
      <div style={{ height: 500, width: 500, border: "1px solid black" }}>
        <LineSegmentSliderInput
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
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
