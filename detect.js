class App extends React.Component {
    //reverensi video and canvas
    videoRef = React.createRef();
    canvasRef = React.createRef();
  //Untuk mengatur letak video webcam, posisi ini agar video webcam ditengah, untuk resolusi laptop yang beda bisa disesuaikan
    styles = {
      position: 'fixed',
      top: 150,
      left: 150,
    };
  //untuk mendeteksi video. jika video webcam tidak terdeteksi maka akan muncul tulisan "Couldn't start the webcam" on console log
    detectFromVideoFrame = (model, video) => {
      model.detect(video).then(predictions => {
        this.showDetections(predictions);
  
        requestAnimationFrame(() => {
          this.detectFromVideoFrame(model, video);
        });
      }, (error) => {
        console.log("Couldn't start the webcam")
        console.error(error)
      });
    };
  // Untuk menampilkan hasil deteksi pada kotak hijau di video
    showDetections = predictions => {
      const ctx = this.canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const font = "24px helvetica";
      ctx.font = font;
      ctx.textBaseline = "top";
  
      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        // Draw the bounding box atau Gambar kotak pembatas. warna dan lebar frame bisa disesuaikan
        ctx.strokeStyle = "#2fff00";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        // Draw the label background.
        ctx.fillStyle = "#2fff00";
        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10);
        // draw top left rectangle
        ctx.fillRect(x, y, textWidth + 10, textHeight + 10);
        // draw bottom left rectangle
        ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);
  
        // Draw the text last to ensure it's on top atau text yang ada diatas kotak
        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
        ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
      });
    };
  
    componentDidMount() {
      if (navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia) {
        // define a Promise that'll be used to load the webcam and read its frames
        // [define Promise] untuk me-load webcam dan membaca frames 
        // Promise yang dimaksud yaitu programming pattern di js (java script) yang bakal return suatu value di masa yang akan datang, makanya pattern ini dipakai utk "deferred and asynchronous computations"
        // artinya kita ga akan ngeblock tampilan web kita sampe model (detection videonya kita) ke-load
        // Jadi di sini kita pakai Promise buat object detection nya
        // di sini ada 2 promise yang kita pake yaitu webcamPromise (buat menggil webcam) dan loadModelPromise (buat manggil model dari coco-ssd yang dijelasin di file index.html)
        const webcamPromise = navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: false,
          })
          .then(stream => {
            // pass the current frame to the window.stream
            window.stream = stream;
            // pass the stream to the videoRef
            this.videoRef.current.srcObject = stream;
  
            return new Promise(resolve => {
              this.videoRef.current.onloadedmetadata = () => {
                resolve();
              };
            });
          }, (error) => {
            console.log("Couldn't start the webcam")
            console.error(error)
          });
  
        // define a Promise that'll be used to load the model
        const loadlModelPromise = cocoSsd.load();
        
        // resolve all the Promises
        Promise.all([loadlModelPromise, webcamPromise])
          .then(values => {
            this.detectFromVideoFrame(values[0], this.videoRef.current);
          })
          .catch(error => {
            console.error(error);
          });
      }
    }
  
    // here we are returning the video frame and canvas to draw,
    // so we are in someway drawing our video "on the go"
    render() {
      return (
        <div> 
          <video
            style={this.styles}
            autoPlay
            muted
            playsInline
            ref={this.videoRef}
            width="720"
            height="600"
          />
          <canvas style={this.styles} ref={this.canvasRef} width="720" height="650" />
        </div>
      );
    }
  }
  
  const domContainer = document.querySelector('#root');
  ReactDOM.render(React.createElement(App), domContainer);
  