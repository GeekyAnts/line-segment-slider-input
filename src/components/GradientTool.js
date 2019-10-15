import React, { Component } from "react";
import "./styles.css";

class GradientTool extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fromX: this.props.from[0],
      fromY: this.props.from[1],
      toX: this.props.to[0],
      toY: this.props.to[1],
      x1: null,
      y1: null,
      x2: null,
      y2: null,
      stops: this.props.stops,
      circles: [],
      dragging: false,
      index: null
    };
  }

  componentDidMount() {
    this.calculateToolData();
  }

  calculateToolData() {
    let stops = this.state.stops;

    let x1 = this.state.fromX * this.props.width;
    let y1 = this.state.fromY * this.props.height;

    let x2 = this.state.toX * this.props.width;
    let y2 = this.state.toY * this.props.height;

    let circles = this.getCircleCoordinates(stops, x1, y1, x2, y2);

    this.setState({
      x1,
      y1,
      x2,
      y2,
      circles
    });
  }

  calculateSlope(x1, y1, x2, y2) {
    let slope = (y2 - y1) / (x2 - x1);
    this.setState({
      slope
    });
  }

  getCircleCoordinates(stops, x1, y1, x2, y2) {
    let circles = [];
    for (let i = 0; i < stops.length; i++) {
      let m = stops[i].position;
      let n = 1 - stops[i].position;

      let x = (m * x2 + n * x1) / (m + n);
      let y = (m * y2 + n * y1) / (m + n);

      let coordinates = [x, y];
      circles.push(coordinates);
    }

    return circles;
  }

  setXInBounds(x) {
    return x / this.props.width;
  }

  setYInBounds(y) {
    return y / this.props.height;
  }

  stopDrag() {
    this.setState({
      dragging: false,
      index: null
    });
  }

  getA() {
    return this.state.y2 - this.state.y1;
  }

  getB() {
    return this.state.x1 - this.state.x2;
  }

  getC() {
    return this.state.x2 * this.state.y1 - this.state.x1 * this.state.y2;
  }

  getClosestPointToLine(x, y) {
    let a = this.getA();
    let b = this.getB();
    let c = this.getC();

    //TODO: (a * a + b * b) shouldn't be zero
    let denominator = a * a + b * b;
    let cX = this.state.x1;
    let cY = this.state.y1;
    if (denominator !== 0) {
      cX = (b * (b * x - a * y) - a * c) / denominator;
      cY = (a * (-1 * b * x + a * y) - b * c) / denominator;
    }

    let minX = Math.min(this.state.x1, this.state.x2);
    let maxX = Math.max(this.state.x1, this.state.x2);
    if (cX < minX) {
      cX = minX;
    } else if (cX > maxX) {
      cX = maxX;
    }

    let minY = Math.min(this.state.y1, this.state.y2);
    let maxY = Math.max(this.state.y1, this.state.y2);
    if (cY < minY) {
      cY = minY;
    } else if (cY > maxY) {
      cY = maxY;
    }

    return [cX, cY];
  }

  getDistanceBetweenPoints(x1, y1, x2, y2) {
    let a = x1 - x2;
    let b = y1 - y2;

    return Math.sqrt(a * a + b * b);
  }

  getClosestPointToLineInFraction(coordinates) {
    let totalLength = this.getDistanceBetweenPoints(
      this.state.x1,
      this.state.y1,
      this.state.x2,
      this.state.y2
    );

    let lengthOfClosestPoint = this.getDistanceBetweenPoints(
      this.state.x1,
      this.state.y1,
      coordinates[0],
      coordinates[1]
    );

    return lengthOfClosestPoint / totalLength;
  }

  onMove(e) {
    if (this.state.index === 0) {
      this.setState({
        fromX: this.setXInBounds(e.clientX),
        fromY: this.setYInBounds(e.clientY)
      });
    } else if (this.state.index === this.state.circles.length - 1) {
      this.setState({
        toX: this.setXInBounds(e.clientX),
        toY: this.setYInBounds(e.clientY)
      });
    } else {
      let closestPointsOnLine = this.getClosestPointToLine(
        e.clientX,
        e.clientY
      );
      let closestPointsOnLineInFraction = this.getClosestPointToLineInFraction(
        closestPointsOnLine
      );
      let stops = this.state.stops;
      stops[this.state.index] = {
        position: closestPointsOnLineInFraction,
        color: stops[this.state.index].color
      };
      //TODO: Callback
      this.setState(stops);
    }
    this.calculateToolData();
  }

  createCircles(e) {
    console.log(e);
    let closestPointsOnLine = this.getClosestPointToLine(e.clientX, e.clientY);
    let closestPointsOnLineInFraction = this.getClosestPointToLineInFraction(
      closestPointsOnLine
    );
    let stops = this.state.stops;
    stops.push({
      position: closestPointsOnLineInFraction,
      color: "#FFFFFF"
    });
    stops.sort(function(a, b) {
      return a.position - b.position;
    });
    this.setState(stops);
    this.calculateToolData();
  }

  render() {
    return (
      <>
        <svg
          height={this.props.height}
          width={this.props.width}
          style={{ backgroundColor: "blue" }}
          onMouseUp={e => {
            e.persist();
            this.stopDrag();
          }}
          onMouseLeave={e => {
            this.stopDrag();
          }}
          onMouseMove={e => {
            e.persist();
            if (this.state.dragging) {
              this.onMove(e);
            }
          }}
        >
          <line
            x1={this.state.x1}
            y1={this.state.y1}
            x2={this.state.x2}
            y2={this.state.y2}
            stroke="#232b2b"
            strokeWidth={2}
            id={"therect"}
            className={"Line"}
            onClick={e => {
              this.createCircles(e);
            }}
          ></line>
          {this.state.circles &&
            this.state.circles.map((circle, index) => {
              return (
                <circle
                  key={index}
                  cx={circle[0]}
                  cy={circle[1]}
                  r={3}
                  stroke={"black"}
                  fill={"white"}
                  strokeWidth={1}
                  onMouseDown={e => {
                    e.persist();
                    this.setState({
                      dragging: true,
                      index: index
                    });
                  }}
                ></circle>
              );
            })}
        </svg>
        <pre>{JSON.stringify(this.state, 4)}</pre>
      </>
    );
  }
}

export default GradientTool;
