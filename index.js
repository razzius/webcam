function range(length) {
  return Array.apply(null, Array(length)).map(
    (_, i) => i
  )
}

WIDTH = 320
HEIGHT = 240
// WIDTH = 640
// HEIGHT = 480

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

setInterval(draw, 8000)
// setTimeout(draw, 2000)
// draw()

var blurRadius = 5

function getCornerPixel(data, x, y) {
  // return green for now
  return [0, 255, 0]
}

function isCorner(x, y, width, height) {
  return x - blurRadius < 0 || y - blurRadius < 0 || x + blurRadius >= width || y + blurRadius >= height
}

function getIndex(x, y) {
  return (x + y * WIDTH) * 4
}

var coefficients1d = [.01, .06, .08, .12, .14, .28]
var reflection = coefficients1d.slice(0, blurRadius)
reflection.reverse()
var coefficients1dReflected = coefficients1d.concat(reflection)

var coefficients = [].concat(...range(2*blurRadius + 1).map(x => {
  return [].concat(...range(2*blurRadius + 1).map(y => {
    return coefficients1dReflected[x] * coefficients1dReflected[y]
  }))
}))

function getPixel(data, x, y) {
  // returns [red, green, blue]
  if (isCorner(x, y, WIDTH, HEIGHT)) {
    return getCornerPixel()
  } else {
    var topLeft = [x - blurRadius, y - blurRadius]
    var indices = [].concat(...range(2*blurRadius + 1).map(xoffset => {
      return [].concat(range(2*blurRadius + 1).map(yoffset => {
        return [topLeft[0] + xoffset, topLeft[1] + yoffset]
      }))
    }))
    return range(3).map(color => {

      return coefficients.reduce((total, coefficient, index) => {
        var [x, y] = indices[index]
        return total + coefficient * data[getIndex(x, y) + color]
      }, 0)
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
