import React from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import "./App.css";

const frame = (video, model, canvasRef) => {
  model.detect(video).then(predictions => {
    renderPrediction(predictions, canvasRef)
    requestAnimationFrame(() => {
      frame(video, model, canvasRef)
    })
  })
}

const renderPrediction = (predictions, canvasRef) => {
  const ctx = canvasRef.current.getContext('2d');
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const font = "16px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";
  predictions.forEach(prediction => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    const width = prediction.bbox[2];
    const height = prediction.bbox[3];

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "#00FFFF";

    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt(font, 10);
    ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
  })

  predictions.forEach(prediction => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    ctx.fillStyle = "#000000";
    ctx.fillText(prediction.class, x, y);
  });

}

const App = () => {
  const videoRef = React.createRef();
  const canvasRef = React.createRef();

  React.useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user"
          }
        })
        .then(stream => {
          window.stream = stream;
          videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      const modelPromise = cocoSsd.load();
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          frame(videoRef.current, values[0], canvasRef);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [videoRef, canvasRef])
  return (
    <div>
      <div style={{position:'absolute', top:600}}>
      <p>Please Wait while machine is learning at first load</p>
      <p>created using love with Tensorflow.js</p>
      <p>Titus Efferian</p>
      </div>
      <video
        autoPlay
        playsInline
        muted
        ref={videoRef}
        className="size"
        width="411"
        height="500"

      />
      <canvas
        className="size"
        ref={canvasRef}
        width="411"
        height="500"
      />
    </div>
  )
}

export default App
