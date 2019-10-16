import React, { Component } from "react";
import "./styles.css";

class GradientTool extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dragging: false,
      x: null,
      y: null
    };

    this.selector = React.createRef();
  }

  componentDidMount() {
    let self = this.selector.current.getBoundingClientRect();
    this.setState({
      x: self.x,
      y: self.y
    });
  }

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
      dragging: false
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
    if (this.props.index === 0) {
      this.props.handleMove("from", [
        this.setXInBounds(e.pageX - this.state.x),
        this.setYInBounds(e.pageY - this.state.y)
      ]);
    } else if (this.props.index === circles.length - 1) {
      this.props.handleMove("to", [
        this.setXInBounds(e.pageX - this.state.x),
        this.setYInBounds(e.pageY - this.state.y)
      ]);
    } else {
      let closestPointsOnLine = this.getClosestPointToLine(
        e.pageX - this.state.x,
        e.pageY - this.state.y,
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
      stops[this.props.index] = {
        position: closestPointsOnLineInFraction,
        color: stops[this.props.index].color
      };
      this.props.handleMove("other", stops);
    }
  }

  createCircles(e, x1, y1, x2, y2) {
    let closestPointsOnLine = this.getClosestPointToLine(
      e.pageX - this.state.x,
      e.pageY - this.state.y,
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
    let newStop = {
      position: closestPointsOnLineInFraction,
      color: "#FFFFFF"
    };
    stops.push(newStop);
    stops.sort(function(a, b) {
      return a.position - b.position;
    });
    let index = stops.findIndex(stop => {
      if (stop === newStop) return true;
      return false;
    });
    this.setState(
      { dragging: true },
      () => {
        this.props.changeIndex(index);
      },
      () => {
        this.props.handleMove("other", stops);
      }
    );
  }

  render() {
    let x1 = this.props.from[0] * this.props.width;
    let y1 = this.props.from[1] * this.props.height;
    let x2 = this.props.to[0] * this.props.width;
    let y2 = this.props.to[1] * this.props.height;

    let circles = this.calculateToolData(this.props.stops, x1, y1, x2, y2);
    return (
      <div>
        <svg
          tabIndex={0}
          onKeyDown={e => {
            e.persist();
            if (e.key === "Backspace") {
              this.props.removeHandle();
            }
          }}
          ref={this.selector}
          height={this.props.height}
          width={this.props.width}
          style={{ backgroundColor: "transparent" }}
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
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <defs>
            <filter id="dropshadow" height="130%">
              <feDropShadow
                dx="1"
                dy="1.5"
                floodColor="black"
                stdDeviation="1.5"
              />
            </filter>
            <filter
              id="dropshadowcircle"
              x="-40%"
              y="-40%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0.1"
                dy="0.6"
                stdDeviation="1.3"
                floodColor="black"
              />
            </filter>
          </defs>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeWidth={1}
            filter="url(#dropshadow)"
          ></line>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeOpacity={0}
            stroke="red"
            fillOpacity={0}
            strokeWidth={5}
            className={"Line"}
            onMouseDown={e => {
              this.createCircles(e, x1, y1, x2, y2);
            }}
          ></line>
          {circles &&
            circles.map((circle, index) => {
              let radius = 4;
              if (index === this.props.index) {
                radius = 5;
              }
              return (
                <circle
                  key={index}
                  cx={circle[0]}
                  cy={circle[1]}
                  r={radius}
                  stroke={"white"}
                  fill={"white"}
                  filter={"url(#dropshadowcircle)"}
                  strokeWidth={1}
                  onMouseDown={e => {
                    e.persist();
                    this.setState(
                      {
                        dragging: true
                      },
                      this.props.changeIndex(index)
                    );
                  }}
                ></circle>
              );
            })}
        </svg>
      </div>
    );
  }
}

export default GradientTool;
