import React, { Component } from "react";
import GradientTool from "./components/GradientTool";

class SVGContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      from: [0.2, 0.2],
      to: [0.8, 0.8],
      index: null,
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
          marginLeft: "30px",
          marginRight: "40px",
          paddingLeft: "30px"
        }}
      >
        <GradientTool
          width={500}
          height={500}
          index={this.state.index}
          changeIndex={this.changeIndex.bind(this)}
          from={this.state.from}
          to={this.state.to}
          stops={this.state.stops}
          handleMove={this.handleMove.bind(this)}
          removeHandle={this.removeHandle.bind(this)}
        />
      </div>
    );
  }
}

export default SVGContainer;
