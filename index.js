function range(length) {
  return Array.apply(null, Array(length)).map(
    (_, i) => i
  )
}

WIDTH = 640
HEIGHT = 480

var video = document.createElement('video')
video.autoplay = true
// video.style.display = 'none'
document.body.appendChild(video)

var canvas = document.createElement('canvas')
canvas.width = WIDTH
canvas.height = HEIGHT

var context = canvas.getContext('2d')

var displayCanvas = document.createElement('canvas')
var displayContext = displayCanvas.getContext('2d')

displayCanvas.width = WIDTH
displayCanvas.height = HEIGHT

document.body.appendChild(displayCanvas)

setInterval(draw, 2000)
// setTimeout(draw, 2000)
// draw()

function draw() {
  context.drawImage(video, 0, 0, WIDTH, HEIGHT)
  var imageData = context.getImageData(0, 0, WIDTH, HEIGHT)
  var outputImage = displayContext.createImageData(WIDTH, HEIGHT)

  var data = imageData.data

  var pixels = data.width * data.height
  data.forEach(function(value, index) {
    outputImage.data[index] = index % 4 === 3 ? 255 :
      index % 4 === 1 ? value : 0
  })

  // data.forEach(function(value, index) {
  //   if (index % 4 === 0) {
  //     outputImage.data[index] = value
  //   } else {
  //     outputImage.data[index] = 0
  //   }
  // })

  displayContext.putImageData(outputImage, 0, 0)
  // range(imageData.width).forEach(x => {
  //   range(imageData.height).forEach(y => {
  //   })
  // })

}

var errorCallback = function(e) {
  console.log('Reeeejected!', e);
};

// Not showing vendor prefixes.
navigator.getUserMedia({video: true}, function(localMediaStream) {
  var video = document.querySelector('video');
  video.src = window.URL.createObjectURL(localMediaStream);

  video.onloadedmetadata = function(e) {
    // Ready to go. Do some stuff.
  };
}, errorCallback);
