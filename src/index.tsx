import React, { Component } from "react";

type Stop = {
  position: number;
  color: string;
};

type PropType = {
  x: number;
  y: number;
  width: number;
  height: number;
  from: Array<number>;
  to: Array<number>;
  stops: Array<Stop>;
  index: number;
  zoom: number;
  scroll: { x: number; y: number };
  rotation?: number;
  changeIndex: (index: number) => void;
  handleMove: (type: string, handle: Array<number> | Array<Stop>) => void;
  removeHandle: () => void;
  onClickOutside?: (e: any) => void;
  onWrapperMouseDown?: (e: any) => void;
  onWrapperMouseUp?: (e: any) => void;
  onWrapperContexMenu?: (e: any) => void;
  onWrapperDoubleClick?: (e: any) => void;
  onWrapperMouseOut?: (e: any) => void;
  onWrapperDrop?: (e: any) => void;
  onDragOver?: (e: any) => void;
  onWrapperMouseMove?: (e: any) => void;
};

function rotatePoint(point: any, angle: number, centroid: any) {
  angle = (angle * Math.PI) / 180.0;
  let newX =
    (point[0] - centroid[0]) * Math.cos(angle) -
    (point[1] - centroid[1]) * Math.sin(angle) +
    centroid[0];
  let newY =
    (point[1] - centroid[1]) * Math.cos(angle) +
    (point[0] - centroid[0]) * Math.sin(angle) +
    centroid[1];
  return [newX, newY];
}

export default class LineSegmentSliderInput extends Component<
  PropType,
  { dragging: boolean }
> {
  selector: any;
  constructor(props: PropType) {
    super(props);
    this.state = {
      dragging: false,
    };
  }
  getRotatedPoint = (e: any) => {
    const rotated = rotatePoint(
      [
        this.getPointWithScrollZoom(e.pageX, "x"),
        this.getPointWithScrollZoom(e.pageY, "y"),
      ],
      this.props.rotation ? -this.props.rotation : 0,
      [
        this.props.x + this.props.width / 2,
        this.props.y + this.props.height / 2,
      ]
    );
    return [rotated[0] - this.props.x, rotated[1] - this.props.y];
  };

  getCircleCoordinates = (
    stops: Array<Stop>,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
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
  };

  setXInBounds = (x: number) => {
    return x / this.props.width;
  };

  setYInBounds = (y: number) => {
    return y / this.props.height;
  };

  stopDrag = () => {
    this.setState({
      dragging: false,
    });
  };

  getCoefficients = (x1: number, y1: number, x2: number, y2: number) => {
    return {
      a: y2 - y1,
      b: x1 - x2,
      c: x2 * y1 - x1 * y2,
    };
  };

  getClosestPointToLine = (
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
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
  };

  getDistanceBetweenPoints = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    let a = x1 - x2;
    let b = y1 - y2;

    return Math.sqrt(a * a + b * b);
  };

  getClosestPointToLineInFraction = (
    coordinates: Array<number>,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    let totalLength = this.getDistanceBetweenPoints(x1, y1, x2, y2);

    let lengthOfClosestPoint = this.getDistanceBetweenPoints(
      x1,
      y1,
      coordinates[0],
      coordinates[1]
    );

    return lengthOfClosestPoint / totalLength;
  };

  getPointWithScrollZoom = (point: number, type: "x" | "y") => {
    const { zoom, scroll } = this.props;
    const newPoint = point / zoom;
    if (type === "x") {
      return newPoint + scroll.x / zoom;
    } else {
      return newPoint + scroll.y / zoom;
    }
  };

  onMove = (
    e: any,
    circles: Array<Array<number>>,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const rotatedPoint = this.getRotatedPoint(e);
    if (this.props.index === 0) {
      const point = [
        this.setXInBounds(rotatedPoint[0]),
        this.setYInBounds(rotatedPoint[1]),
      ];
      this.props.handleMove("from", point);
    } else if (this.props.index === circles.length - 1) {
      this.props.handleMove("to", [
        this.setXInBounds(rotatedPoint[0]),
        this.setYInBounds(rotatedPoint[1]),
      ]);
    } else {
      let closestPointsOnLine = this.getClosestPointToLine(
        rotatedPoint[0],
        rotatedPoint[1],
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
        color: stops[this.props.index].color,
      };
      this.props.handleMove("other", stops);
    }
  };

  createCircles = (e: any, x1: number, y1: number, x2: number, y2: number) => {
    const rotatedPoint = this.getRotatedPoint(e);
    let closestPointsOnLine = this.getClosestPointToLine(
      rotatedPoint[0],
      rotatedPoint[1],
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
      color: "#FFFFFF",
    };
    stops.push(newStop);
    stops.sort(function(a, b) {
      return a.position - b.position;
    });
    let index = stops.findIndex(stop => {
      if (stop === newStop) return true;
      return false;
    });
    this.setState({ dragging: true }, () => {
      this.props.changeIndex(index);
      this.props.handleMove("other", stops);
    });
  };

  render() {
    let x1 = this.props.from[0] * this.props.width;
    let y1 = this.props.from[1] * this.props.height;
    let x2 = this.props.to[0] * this.props.width;
    let y2 = this.props.to[1] * this.props.height;
    const { zoom } = this.props;
    let circles = this.getCircleCoordinates(this.props.stops, x1, y1, x2, y2);
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
        onMouseDown={this.props.onWrapperMouseDown}
        onContextMenu={this.props.onWrapperContexMenu}
        onDoubleClick={this.props.onWrapperDoubleClick}
        onMouseOut={this.props.onWrapperMouseOut}
        onDrop={this.props.onWrapperDrop}
        onDragOver={this.props.onDragOver}
        onMouseMove={e => {
          e.persist();
          if (this.state.dragging) {
            this.onMove(e, circles, x1, y1, x2, y2);
          } else if (this.props.onWrapperMouseMove) {
            this.props.onWrapperMouseMove(e);
          }
        }}
        onMouseUp={e => {
          e.persist();
          if (this.state.dragging) {
            this.stopDrag();
          } else if (this.props.onWrapperMouseUp) {
            this.props.onWrapperMouseUp(e);
          }
        }}
        onClick={this.props.onClickOutside}
        onKeyDown={e => {
          e.persist();
          if (e.key === "Backspace") {
            this.props.removeHandle();
          }
        }}
      >
        <svg
          tabIndex={0}
          height={this.props.height}
          width={this.props.width}
          style={{
            transform: this.props.rotation
              ? `rotate(${this.props.rotation}deg)`
              : undefined,
            position: "absolute",
            backgroundColor: "transparent",
            top: this.props.y,
            left: this.props.x,
            outline: "none",
            overflow: "visible",
          }}
          onClick={e => {
            e.stopPropagation();
          }}
          onMouseDown={e => {
            e.stopPropagation();
          }}
          onContextMenu={e => {
            e.stopPropagation();
          }}
          onDoubleClick={e => {
            e.stopPropagation();
          }}
          onMouseOut={e => {
            e.stopPropagation();
          }}
          onDrop={e => {
            e.stopPropagation();
          }}
          onDragOver={e => {
            e.stopPropagation();
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
            stroke="black"
            strokeWidth={2.5 / zoom}
            opacity={0.3}
          ></line>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeWidth={1.75 / zoom}
          ></line>
          <line
            style={{ cursor: "crosshair" }}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeOpacity={0}
            stroke="red"
            fillOpacity={0}
            strokeWidth={10 / zoom}
            onMouseOver={() => {}}
            onMouseDown={e => {
              this.createCircles(e, x1, y1, x2, y2);
            }}
          />
          {circles &&
            circles.map((circle, index) => {
              let radius = 4 / zoom;
              if (index === this.props.index) {
                radius = 6 / zoom;
              }
              return (
                <g key={`wrapper-${index}`}>
                  <circle
                    key={`outer-circle-${index}`}
                    style={{ cursor: "pointer" }}
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
                          dragging: true,
                        },
                        () => {
                          this.props.changeIndex(index);
                        }
                      );
                    }}
                  />
                  <circle
                    style={{ cursor: "grab" }}
                    key={`inner-circle-${index}`}
                    cx={circle[0]}
                    cy={circle[1]}
                    r={radius - 1}
                    fill={this.props.stops[index].color}
                    onMouseDown={e => {
                      e.persist();
                      this.setState(
                        {
                          dragging: true,
                        },
                        () => {
                          this.props.changeIndex(index);
                        }
                      );
                    }}
                  />
                </g>
              );
            })}
        </svg>
      </div>
    );
  }
}
