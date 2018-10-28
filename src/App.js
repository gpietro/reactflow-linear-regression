import React, { Component } from 'react';
import { Container, Col, Row, Jumbotron} from 'reactstrap'
import * as tf from '@tensorflow/tfjs';

import * as d3 from "d3"

const lineFunction = d3.line()
                         .x(function(d) { return d.x; })
                         .y(function(d) { return d.y; })

const normalize = (width, height) => (x, y) => ({x: x/width, y: (height-y)/height})
const denormalize = (width, height) => (x, y) => ({x: x*width, y: -1*(height*y-height)})

class App extends Component {

  state = {
    points: []
  }

  learningRate = 0.2
  optimizer = tf.train.sgd(this.learningRate)
  m = tf.variable(tf.scalar(Math.random()))
  b = tf.variable(tf.scalar(Math.random()))

  loss(pred, label) {
    return pred.sub(label).square().mean()
  }

  train() {
    const { points } = this.state
    const ys = tf.tensor1d(points.map(point => point.y))
    this.optimizer.minimize(() => this.loss(this.predict(points.map(point => point.x)), ys))
  }

  predict(x) {
    const xs = tf.tensor1d(x);
    // linear function: y = m*x + b
    const ys = xs.mul(this.m).add(this.b)    
    return ys
  }

  addCircle(coordX, coordY) {
    const {x, y, width, height} = this.svgContainer.getBoundingClientRect()
    const { points } = this.state
    const normalized = normalize(width, height)(coordX - x, coordY - y)
    const newPoint = {x: normalized.x, y: normalized.y}
    this.setState({ points: [...points, newPoint] })    
  }

  draw() {
    if(this.svgContainer) {
      const { points } = this.state    
      const svgContainer = this.svgContainer.getBoundingClientRect();
      return points.map(point => {
        const {x, y} = denormalize(svgContainer.width, svgContainer.height)(point.x, point.y)        
        return <Circle key={`point-${x}-${y}`} x={x} y={y} />
      })
    }    
  }

  render() {
    return (
      <Container>
        <Jumbotron>
          <h4>Linear regression</h4>
        </Jumbotron>
        <Row>
          <Col xs={12}>
          <svg ref={(e) => this.svgContainer = e } 
            width="100%" height={500} 
            style={{background:'red'}} 
            onMouseDown={(e) => this.addCircle(e.clientX, e.clientY)}>
              { this.draw() }
              {/* <path d={lineFunction(points)}/> */}
          </svg>          
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;

const Circle = ({x, y}) => <circle cx={x} cy={y} r="4" stroke="black" strokeWidth="1" fill="yellow"/>

