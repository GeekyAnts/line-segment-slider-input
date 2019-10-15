import React, { Component } from "react";
import "./styles.css";

class GradientTool extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dragging: false,
      index: null,
      info: ""
    };
  }

  offsetX = 0;
  offsetY = 0;

  calculateToolData(stops, x1, y1, x2, y2) {
    let circles = this.getCircleCoordinates(stops, x1, y1, x2, y2);

    return circles;
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

  getCoefficients(x1, y1, x2, y2) {
    return {
      a: y2 - y1,
      b: x1 - x2,
      c: x2 * y1 - x1 * y2
    };
  }

  getClosestPointToLine(x, y, x1, y1, x2, y2) {
    let { a, b, c } = this.getCoefficients(x1, y1, x2, y2);

    //WARNING: (a * a + b * b) shouldn't be zero
    let denominator = a * a + b * b;
    let cX = x1;
    let cY = y1;
    if (denominator !== 0) {
      cX = (b * (b * x - a * y) - a * c) / denominator;
      cY = (a * (-1 * b * x + a * y) - b * c) / denominator;
    }

    let minX = Math.min(x1, x2);
    let maxX = Math.max(x1, x2);
    if (cX < minX) {
      cX = minX;
    } else if (cX > maxX) {
      cX = maxX;
    }

    let minY = Math.min(y1, y2);
    let maxY = Math.max(y1, y2);
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

  getClosestPointToLineInFraction(coordinates, x1, y1, x2, y2) {
    let totalLength = this.getDistanceBetweenPoints(x1, y1, x2, y2);

    let lengthOfClosestPoint = this.getDistanceBetweenPoints(
      x1,
      y1,
      coordinates[0],
      coordinates[1]
    );

    return lengthOfClosestPoint / totalLength;
  }

  onMove(e, circles, x1, y1, x2, y2) {
    if (this.state.index === 0) {
      this.props.handleChange("from", [
        this.setXInBounds(x1 + e.movementX),
        this.setYInBounds(y1 + e.movementY)
      ]);
    } else if (this.state.index === circles.length - 1) {
      this.props.handleChange("to", [
        this.setXInBounds(x2 + e.movementX),
        this.setYInBounds(y2 + e.movementY)
      ]);
    } else {
      let closestPointsOnLine = this.getClosestPointToLine(
        e.pageX,
        e.pageY,
        x1,
        y1,
        x2,
        y2
      );
      let closestPointsOnLineInFraction = this.getClosestPointToLineInFraction(
        closestPointsOnLine,
        x1,
        y1,
        x2,
        y2
      );
      let stops = this.props.stops;
      stops[this.state.index] = {
        position: closestPointsOnLineInFraction,
        color: stops[this.state.index].color
      };
      this.props.handleChange("other", stops);
    }
  }

  createCircles(e, x1, y1, x2, y2) {
    console.log(x1, y1, x2, y2, e.clientX, e.clientY);
    // let pointPositionFromStart = this.getDistanceBetweenPoints(
    //   x1,
    //   y1,
    //   e.clientX,
    //   e.clientY
    // );
    // let totalDistance = this.getDistanceBetweenPoints(x1, y1, x2, y2);
    // console.log(pointPositionFromStart, totalDistance);
    // let closestPointsOnLine = this.getClosestPointToLine(
    //   x1 e.clientX,
    //   e.clientY,
    //   x1,
    //   y1,
    //   x2,
    //   y2
    // );
    // let closestPointsOnLineInFraction = this.getClosestPointToLineInFraction(
    //   closestPointsOnLine,
    //   x1,
    //   y1,
    //   x2,
    //   y2
    // );
    // let stops = this.props.stops;
    // stops.push({
    //   position: pointPositionFromStart / totalDistance,
    //   color: "#FFFFFF"
    // });
    // stops.sort(function(a, b) {
    //   return a.position - b.position;
    // });
    // this.props.handleChange("other", stops);
  }

  render() {
    let x1 = this.props.from[0] * this.props.width;
    let y1 = this.props.from[1] * this.props.height;
    let x2 = this.props.to[0] * this.props.width;
    let y2 = this.props.to[1] * this.props.height;

    let circles = this.calculateToolData(this.props.stops, x1, y1, x2, y2);
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
              this.onMove(e, circles, x1, y1, x2, y2);
            }
          }}
        >
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#232b2b"
            strokeWidth={2}
            id={"therect"}
            className={"Line"}
            onClick={e => {
              this.createCircles(e, x1, y1, x2, y2);
            }}
          ></line>
          {circles &&
            circles.map((circle, index) => {
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
                    this.offsetX = e.pageX;
                    this.offsetY = e.pageY;
                    this.setState({
                      dragging: true,
                      index
                    });
                  }}
                ></circle>
              );
            })}
        </svg>
        <pre>{`Gradient Tool State: ${JSON.stringify(this.state)}`}</pre>
        <pre>{`Gradient Tool Props: ${JSON.stringify(this.props)}`}</pre>
      </>
    );
  }
}

export default GradientTool;
