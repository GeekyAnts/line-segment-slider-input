import React, { Component } from "react";
import GradientTool from "./components/GradientTool";

class SVGContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      from: [0.2, 0.2],
      to: [0.8, 0.8],
      stops: [
        {
          position: 0,
          color: "white"
        },
        {
          position: 0.2,
          color: "white"
        },
        {
          position: 1,
          color: "white"
        }
      ]
    };
  }

  handleChange(type, handle) {
    if (type === "from") {
      this.setState({ from: handle });
    } else if (type === "to") {
      this.setState({ to: handle });
    } else {
      this.setState({ stops: handle });
    }
  }

  render() {
    return (
      <div
        style={
          {
            // margin: "30px"
          }
        }
      >
        <GradientTool
          width={500}
          height={500}
          // x={30}
          // y={30}
          from={this.state.from}
          to={this.state.to}
          stops={this.state.stops}
          handleChange={this.handleChange.bind(this)}
        />
        <pre>{`SVG Container State: ${JSON.stringify(this.state)}`}</pre>
      </div>
    );
  }
}

export default SVGContainer;