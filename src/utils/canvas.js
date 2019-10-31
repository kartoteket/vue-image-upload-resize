/**
 * @function getHalfScaleCanvas
 * @description - return a canvas divided by 2
 * @param  {HTMLElement} canvas - input document canvas element
 * @returns  {HTMLElement} half of input canvas
 */
export const getHalfScaleCanvas = canvas => {
  const halfCanvas = document.createElement('canvas')
  halfCanvas.width = canvas.width / 2
  halfCanvas.height = canvas.height / 2

  halfCanvas.getContext('2d').drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height)

  return halfCanvas
}

/**
 * @inner
 * @function unitSquare
 * @description returns the matrix unit square
 */
const unitSquare = (f00, f10, f01, f11, x, y) => {
  const un_x = 1.0 - x
  const un_y = 1.0 - y
  return f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y
}

/**
 * @function applyBilinearInterpolation
 * @description Interpolation
 * @param  {ImageData} srcCanvasData - Pixel data of source canvas
 * @param  {ImageData} destCanvasData - Pixel data of destionation canvas
 * @param  {int} scale - Resize scale (max width / original width)
 * @author http://web.archive.org/web/20120123142531/http://www.philou.ch/js-bilinear-interpolation.html
 */
const applyBilinearInterpolation = (srcCanvasData, destCanvasData, scale) => {
  let i, j
  let iyv, iy0, iy1, ixv, ix0, ix1
  let idxD, idxS00, idxS10, idxS01, idxS11
  let dx, dy
  let r, g, b, a
  for (i = 0; i < destCanvasData.height; ++i) {
    iyv = i / scale
    iy0 = Math.floor(iyv)
    // Math.ceil can go over bounds
    iy1 = Math.ceil(iyv) > srcCanvasData.height - 1 ? srcCanvasData.height - 1 : Math.ceil(iyv)
    for (j = 0; j < destCanvasData.width; ++j) {
      ixv = j / scale
      ix0 = Math.floor(ixv)
      // Math.ceil can go over bounds
      ix1 = Math.ceil(ixv) > srcCanvasData.width - 1 ? srcCanvasData.width - 1 : Math.ceil(ixv)
      idxD = (j + destCanvasData.width * i) * 4
      // matrix to vector indices
      idxS00 = (ix0 + srcCanvasData.width * iy0) * 4
      idxS10 = (ix1 + srcCanvasData.width * iy0) * 4
      idxS01 = (ix0 + srcCanvasData.width * iy1) * 4
      idxS11 = (ix1 + srcCanvasData.width * iy1) * 4
      // overall coordinates to unit square
      dx = ixv - ix0
      dy = iyv - iy0
      // I let the r, g, b, a on purpose for debugging
      r = unitSquare(srcCanvasData.data[idxS00], srcCanvasData.data[idxS10], srcCanvasData.data[idxS01], srcCanvasData.data[idxS11], dx, dy)
      destCanvasData.data[idxD] = r

      g = unitSquare(srcCanvasData.data[idxS00 + 1], srcCanvasData.data[idxS10 + 1], srcCanvasData.data[idxS01 + 1], srcCanvasData.data[idxS11 + 1], dx, dy)
      destCanvasData.data[idxD + 1] = g

      b = unitSquare(srcCanvasData.data[idxS00 + 2], srcCanvasData.data[idxS10 + 2], srcCanvasData.data[idxS01 + 2], srcCanvasData.data[idxS11 + 2], dx, dy)
      destCanvasData.data[idxD + 2] = b

      a = unitSquare(srcCanvasData.data[idxS00 + 3], srcCanvasData.data[idxS10 + 3], srcCanvasData.data[idxS01 + 3], srcCanvasData.data[idxS11 + 3], dx, dy)
      destCanvasData.data[idxD + 3] = a
    }
  }
}

/**
 * @function scaleCanvasWithAlgorithm
 * @description Scale Canvas. Scales the
 * @param {HTMLElement} canvas - canvas element before finale resize
 * @param {int} maxWidth - max image width
 * @returns {HTMLElement} - canvas resized to scale
 */
export const scaleCanvasWithAlgorithm = (canvas, maxWidth) => {
  const scaledCanvas = document.createElement('canvas')
  const scale = maxWidth / canvas.width

  scaledCanvas.width = canvas.width * scale
  scaledCanvas.height = canvas.height * scale

  const srcImgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
  const destImgData = scaledCanvas.getContext('2d').createImageData(scaledCanvas.width, scaledCanvas.height)

  applyBilinearInterpolation(srcImgData, destImgData, scale)

  scaledCanvas.getContext('2d').putImageData(destImgData, 0, 0)

  return scaledCanvas
}