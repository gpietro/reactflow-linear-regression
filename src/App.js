import React, { Component } from "react";
import { Container, Col, Row, Jumbotron } from "reactstrap";
import { train, predict } from "./trainModel";

const normalize = (width, height) => (x, y) => ({
  x: x / width,
  y: (height - y) / height
});
const denormalize = (width, height) => (x, y) => ({
  x: x * width,
  y: -1 * (height * y - height)
});

class App extends Component {
  state = {
    points: []
  };

  addCircle = (coordX, coordY) => {
    const { x, y, width, height } = this.svgContainer.getBoundingClientRect();
    const { points } = this.state;
    const normalized = normalize(width, height)(coordX - x, coordY - y);
    const newPoint = { x: normalized.x, y: normalized.y };
    this.setState({ points: [...points, newPoint] });
  };

  draw = () => {
    if (this.svgContainer) {
      const { points } = this.state;
      const svgContainer = this.svgContainer.getBoundingClientRect();
      return points.map(point => {
        const { x, y } = denormalize(svgContainer.width, svgContainer.height)(
          point.x,
          point.y
        );
        return <Circle key={`point-${x}-${y}`} x={x} y={y} />;
      });
    }
  };

  drawLine = () => {
    const svgContainer = this.svgContainer.getBoundingClientRect();
    const xs = [0, 1];
    const ys = predict(xs).dataSync();

    const { x: x1, y: y1 } = denormalize(
      svgContainer.width,
      svgContainer.height
    )(xs[0], ys[0]);

    const { x: x2, y: y2 } = denormalize(
      svgContainer.width,
      svgContainer.height
    )(xs[1], ys[1]);
    return (
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="orange" strokeWidth="2" />
    );
  };

  render() {
    const { points } = this.state;
    if (points.length > 1) {
      for (let i = 0; i < 10; i++) {
        train(points);
      }
    }

    return (
      <Container>
        <Jumbotron>
          <h4>Linear regression</h4>
        </Jumbotron>
        <Row>
          <Col xs={12}>
            <svg
              ref={e => (this.svgContainer = e)}
              width="100%"
              height={500}
              style={{ background: "grey" }}
              onMouseDown={e => this.addCircle(e.clientX, e.clientY)}
            >
              {this.draw()}
              {points.length > 1 ? this.drawLine() : null}
            </svg>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;

const Circle = ({ x, y }) => (
  <circle cx={x} cy={y} r="4" stroke="black" strokeWidth="1" fill="yellow" />
);
