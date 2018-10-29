import React, { Component } from "react";
import {
  Container,
  Col,
  Row,
  Jumbotron,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from "reactstrap";
import { train, predict } from "./trainModel";
import NumPad from "react-numpad";

const normalize = (width, height) => (x, y) => ({
  x: x / width,
  y: (height - y) / height
});
const denormalize = (width, height) => (x, y) => ({
  x: x * width,
  y: -1 * (height * y - height)
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      points: [],
      trains: 10
    };
  }

  updateDimensions = () => {
    const { width, height } = this.svgContainer.getBoundingClientRect();
    this.normalize = normalize(width, height);
    this.denormalize = denormalize(width, height);
  };

  componentDidMount = () => {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  };

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.updateDimensions);
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    if (nextState.points.length > 1) {
      for (let i = 0; i < nextState.trains; i++) {
        train(nextState.points);
      }
    }
    return true;
  };

  addCircle = (coordX, coordY) => {
    const { x, y } = this.svgContainer.getBoundingClientRect();
    const { points } = this.state;
    const normalized = this.normalize(coordX - x, coordY - y);
    const newPoint = { x: normalized.x, y: normalized.y };
    this.setState({ points: [...points, newPoint] });
  };

  drawCircle = () => {
    if (this.svgContainer) {
      const { points } = this.state;
      return points.map(point => {
        const { x, y } = this.denormalize(point.x, point.y);
        return (
          <circle
            key={`point-${x}-${y}`}
            cx={x}
            cy={y}
            r="4"
            stroke="black"
            strokeWidth="1"
            fill="white"
          />
        );
      });
    }
  };

  drawLine = () => {
    const { points } = this.state;
    if (points.length > 1) {
      const xs = [0, 1];
      const ys = predict(xs).dataSync();
      const { x: x1, y: y1 } = this.denormalize(xs[0], ys[0]);
      const { x: x2, y: y2 } = this.denormalize(xs[1], ys[1]);
      return (
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="red" strokeWidth="2" />
      );
    }
  };

  render() {
    return (
      <Container>
        <Jumbotron>
          <h3 className="display-3">Linear regression with Tensorflow.js</h3>
          <p className="lead">
            Exercise to get started with Tensorflow.js and try it with React.js
            😀
          </p>
        </Jumbotron>
        <Row>
          <Col xs={4}>
            <NumPad.PositiveIntegerNumber
              onChange={value => this.setState({ trains: value })}
              position="startBottomLeft"
            >
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>Training loops</InputGroupText>
                </InputGroupAddon>
                <Input type="number" value={this.state.trains} />
              </InputGroup>
            </NumPad.PositiveIntegerNumber>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <hr />
            <h4>Click here 👇</h4>
            <svg
              ref={e => (this.svgContainer = e)}
              width="100%"
              height={500}
              style={{ background: "grey" }}
              onMouseDown={e => this.addCircle(e.clientX, e.clientY)}
            >
              {this.drawCircle()}
              {this.drawLine()}
            </svg>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
