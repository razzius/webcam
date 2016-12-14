function range(length) {
  return Array.apply(null, Array(length)).map(
    (_, i) => i
  )
}

WIDTH = 640
HEIGHT = 480

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

setInterval(draw, 160)
// setTimeout(draw, 1000)
// draw()


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
var blurRadius = coefficients1d.length - 1
// var coefficients1d = [.01, .06, .27, .32]
var reflection = coefficients1d.slice(0, blurRadius)
reflection.reverse()
var coefficients1dReflected = coefficients1d.concat(reflection)

var coefficients = [].concat(...range(2*blurRadius + 1).map(x => {
  return [].concat(...range(2*blurRadius + 1).map(y => {
    return coefficients1dReflected[x] * coefficients1dReflected[y]
  }))
}))

function processImage(data) {
  var output = new Uint8ClampedArray(WIDTH * HEIGHT * 4)

  for(var x = 0; x < WIDTH; x++) {
    for(var y = 0; y < HEIGHT; y++) {
      var index = y * WIDTH + x
      var redIndex = index * 4
      var greenIndex = index * 4 + 1
      var blueIndex = index * 4 + 2
      var alphaIndex = index * 4 + 3

      // var [red, green, blue] = getPixel(data, x, y)
      if (x - blurRadius < 0 || y - blurRadius < 0 || x + blurRadius >= WIDTH || y + blurRadius >= HEIGHT) {
        output[redIndex] = 0
        output[greenIndex] = 255
        output[blueIndex] = 0
      } else {
        var red = 0
        var green = 0
        var blue = 0

        var index = 0

        for (var xo = -blurRadius; xo <= blurRadius; xo++) {
          for (var yo = -blurRadius; yo <= blurRadius; yo++) {
            red += data[((x + xo) + (y + yo) * WIDTH)*4] * coefficients[index]
            green += data[((x + xo) + (y + yo) * WIDTH)*4 + 1] * coefficients[index]
            blue += data[((x + xo) + (y + yo) * WIDTH)*4 + 2] * coefficients[index]
            index++
          }
        }

        output[redIndex] = red
        output[greenIndex] = green
        output[blueIndex] = blue
      }
      output[alphaIndex] = 255
    }
  }

  return output
}

function draw() {
  context.drawImage(video, 0, 0, WIDTH, HEIGHT)
  var imageData = context.getImageData(0, 0, WIDTH, HEIGHT)

  var data = imageData.data

  var output = processImage(data)

  displayContext.putImageData(new ImageData(output, WIDTH, HEIGHT), 0, 0)
}

// Not showing vendor prefixes.
navigator.getUserMedia({video: true}, function(mediaStream) {
  video.src = window.URL.createObjectURL(mediaStream);
}, err => {debugger});
