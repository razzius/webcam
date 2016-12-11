function range(length) {
  return Array.apply(null, Array(length)).map(
    (_, i) => i
  )
}

WIDTH = 320
HEIGHT = 240

var video = document.createElement('video')
video.autoplay = true
video.width = WIDTH
video.height = HEIGHT
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

// var blurRadius = 3
// 3x3 pixel blur

function getCornerPixel(data, x, y) {
  // return green for now
  return [0, 255, 0]
}

function isCorner(x, y, width, height) {
  return x - 1 < 0 || y - 1 < 0 || x + 1 >= width || y + 1 >= height
}

function getIndex(x, y) {
  return (x + y * WIDTH) * 4
}

function getPixel(data, x, y) {
  // returns [red, green, blue]
  // uses matrix .1 .8 .1 ->
  // .01 .08 .01
  // .08 .64 .08
  // .01 .08 .01
  if (isCorner(x, y, WIDTH, HEIGHT)) {
    return getCornerPixel()
  } else {
    return range(3).map(color => {
      coefficients = [.01, .08, .01, .08, .64, .08, .01, .08, .01]
      indices = [
        [x - 1, y - 1],
        [x, y - 1],
        [x + 1, y - 1],
        [x - 1, y],
        [x, y],
        [x + 1, y],
        [x - 1, y + 1],
        [x, y + 1],
        [x + 1, y + 1],
      ]
      return coefficients.reduce((total, coefficient, index) => {
        var [x, y] = indices[index]
        return total + coefficient * data[getIndex(x, y) + color]
      }, 0)
      // return data[(x + y * WIDTH) * 4 + color]
      // return data[(x + y * WIDTH) * 4] + color // grayscale lol
    })
  }
}

function draw() {
  context.drawImage(video, 0, 0, WIDTH, HEIGHT)
  var imageData = context.getImageData(0, 0, WIDTH, HEIGHT)
  var outputImage = displayContext.createImageData(WIDTH, HEIGHT)

  var data = imageData.data

  var pixels = data.width * data.height

  // data.forEach(function(value, index) {
  //   outputImage.data[index] = index % 4 === 3 ? 255 :
  //     index % 4 === 1 ? value : 0
  // })

  // data.forEach(function(value, index) {
  //   if (index % 4 === 0) {
  //     outputImage.data[index] = value
  //   } else {
  //     outputImage.data[index] = 0
  //   }
  // })

  range(WIDTH).forEach(x => {
    range(HEIGHT).forEach(y => {
      var index = y * WIDTH + x
      var redIndex = index * 4
      var greenIndex = index * 4 + 1
      var blueIndex = index * 4 + 2
      var alphaIndex = index * 4 + 3

      var [red, green, blue] = getPixel(data, x, y)

      outputImage.data[redIndex] = red
      outputImage.data[greenIndex] = green
      outputImage.data[blueIndex] = blue
      outputImage.data[alphaIndex] = 255
    })
  })

  displayContext.putImageData(outputImage, 0, 0)

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
