import * as tf from "@tensorflow/tfjs";

const learningRate = 0.2;
const optimizer = tf.train.sgd(learningRate);
var m = tf.variable(tf.scalar(Math.random()));
var b = tf.variable(tf.scalar(Math.random()));

const loss = (pred, label) =>
  pred
    .sub(label)
    .square()
    .mean();

const train = points => {
  const ys = tf.tensor1d(points.map(point => point.y));
  optimizer.minimize(() => loss(predict(points.map(point => point.x)), ys));
};

const predict = x => {
  return tf.tidy(() => {
    const xs = tf.tensor1d(x);
    // linear function: y = m*x + b
    const ys = xs.mul(m).add(b);
    return ys;
  });
};

export { train, predict };
