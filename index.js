function range(length) {
  return Array.apply(null, Array(length)).map(
    (_, i) => i
  )
}

WIDTH = 320
HEIGHT = 240
// WIDTH = 160
// HEIGHT = 120

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

setInterval(draw, 200)
// setTimeout(draw, 1000)
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
    // var topLeft = [x - blurRadius, y - blurRadius]
    // var indices = [].concat(...range(2*blurRadius + 1).map(xoffset => {
    //   return [].concat(range(2*blurRadius + 1).map(yoffset => {
    //     return [topLeft[0] + xoffset, topLeft[1] + yoffset]
    //   }))
    // }))
    // return range(3).map(color => {

    //   return coefficients.reduce((total, coefficient, index) => {
    //     var [x, y] = indices[index]
    //     return total + coefficient * data[getIndex(x, y) + color]
    //   }, 0)
    // })
    var totals = [0, 0, 0]
    for (var c = 0; c < 3; c++) {
      var index = 0
      for (var xo = -blurRadius; xo <= blurRadius; xo++) {
        for (var yo = -blurRadius; yo <= blurRadius; yo++) {
          totals[c] += data[((x + xo) + (y + yo) * WIDTH)*4 + c] * coefficients[index]
          index++
        }
      }
    }
    return totals
  }
}

function processImage(data) {
  var output = new Uint8ClampedArray(WIDTH * HEIGHT * 4)

  for(var x = 0; x < WIDTH; x++) {
    for(var y = 0; y < HEIGHT; y++) {
      var index = y * WIDTH + x
      var redIndex = index * 4
      var greenIndex = index * 4 + 1
      var blueIndex = index * 4 + 2
      var alphaIndex = index * 4 + 3

      var [red, green, blue] = getPixel(data, x, y)

      output[redIndex] = red
      output[greenIndex] = green
      output[blueIndex] = blue
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
