import log from './logger'
import EXIF from './exif.js'
import { getHalfScaleCanvas, scaleCanvasWithAlgorithm } from './canvas.js'

/**
 * @function createScaledImage
 * @description Scales the image supplied
 * @param {File}    file The current original uploaded file
 * @param {Object}  options - a set of options controlling operation
 * @return {}         nada (yet)
 */
export const createScaledImage = (file, options) => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const reader = new window.FileReader()

    reader.onload = e => {
      log('reader.onload() is triggered', 2)

      img.src = e.target.result
      img.onload = () => {
        log('img.onload() is triggered', 2)

        if (options.autoRotate && options.hasExifLibrary) {
          EXIF.getData(img, function() {
            const orientation = EXIF.getTag(this, 'Orientation')
            log('ImageUploader: image orientation from EXIF tag = ' + orientation)
            resolve({
              img,
              orientation,
            })
            // that.scaleImage(img, orientation)
          })
        } else {
          resolve({
            img,
          })
          // that.scaleImage(img)
        }
      }
    }
    reader.onerror = reject

    reader.readAsDataURL(file)
  })
}



/**
 * Performance orientation and scaling logic
 * @param  {HTMLElement}  img -  A document img element containing the uploaded file as a base64 encoded string as source
 * @param  {File}         originalFile - The current original uploaded file
 * @param  {int}          [orientation = 1] - Exif-extracted orientation code
 * @param  {Object}       options - the options passed to the function
 *
 * @returns {String}      imagedata as base64 encoded string
 */
export const scaleImage = (img, originalFile, orientation = 1, options = {}) => {
  log('scaleImage() is called', 2)

  let canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.save()

  // Good explanation of EXIF orientation is here http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
  if (orientation > 1) {
    const width = canvas.width
    const styleWidth = canvas.style.width
    const height = canvas.height
    const styleHeight = canvas.style.height

    if (orientation > 4) {
      canvas.width = height
      canvas.style.width = styleHeight
      canvas.height = width
      canvas.style.height = styleWidth
    }

    /**
     * @see {@link http://sylvana.net/jpegcrop/exif_orientation.html} for description of orientations
     */
    switch (orientation) {
      case 2: // top	right side
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
        break
      case 3: // bottom	right side
        ctx.translate(width, height)
        ctx.rotate(Math.PI)
        break
      case 4: // bottom	left side
        ctx.translate(0, height)
        ctx.scale(1, -1)
        break
      case 5: // left side	top
        ctx.rotate(0.5 * Math.PI)
        ctx.scale(1, -1)
        break
      case 6: // right side	top
        ctx.rotate(0.5 * Math.PI)
        ctx.translate(0, -height)
        break
      case 7: // right side	bottom
        ctx.rotate(0.5 * Math.PI)
        ctx.translate(width, -height)
        ctx.scale(-1, 1)
        break
      case 8: // left side	bottom
        ctx.rotate(-0.5 * Math.PI)
        ctx.translate(-width, 0)
        break
    }
  }
  ctx.drawImage(img, 0, 0)
  ctx.restore()

  // Let's find the max available width for scaled image
  const ratio = canvas.width / canvas.height
  let mWidth = Math.min(options.maxWidth, ratio * options.maxHeight)

  // suggested re-write by https://github.com/ryancramerdesign
  // https://github.com/rossturner/HTML5-ImageUploader/issues/13
  if (options.maxSize > 0 && options.maxSize < (canvas.width * canvas.height) / 1000000) {
    const mSize = Math.floor(Math.sqrt(options.maxSize * ratio) * 1000)
    mWidth = mWidth > 0 ? Math.min(mWidth, mSize) : mSize
  }

  if (options.scaleRatio) {
    mWidth = Math.min(mWidth, Math.floor(options.scaleRatio * canvas.width))
  }

  // store dimensions
  options.dimensions.orgWidth = canvas.width
  options.dimensions.orgHeight = canvas.height
  options.dimensions.width = mWidth
  options.dimensions.height = Math.floor(mWidth / ratio)

  log('ImageUploader: original image size = ' + canvas.width + ' X ' + canvas.height)
  log('ImageUploader: scaled image size = ' + mWidth + ' X ' + Math.floor(mWidth / ratio))

  if (mWidth <= 0) {
    mWidth = 1
    console.warning('ImageUploader: image size is too small')
  }

  // simple resize with a 2:1 ratio
  while (canvas.width >= 2 * mWidth) {
    canvas = getHalfScaleCanvas(canvas)
  }

  // When factor less than 2:1 remains, finish up with alogorithm
  if (canvas.width > mWidth) {
    canvas = scaleCanvasWithAlgorithm(canvas, mWidth)
  }


  // suggested re-write by https://github.com/ryancramerdesign
  // https://github.com/rossturner/HTML5-ImageUploader/issues/13
  const quality = originalFile.type === 'image/jpeg' ? options.quality : 1.0
  const imageData = canvas.toDataURL(originalFile.type, quality)
  // if (typeof this.onScale === 'function') {
  //   this.onScale(imageData)
  // }

  log('New ImageData is ready', 2)

  return imageData
  // Display preview of the new image
  // if (this.preview) {
  //   this.imagePreview = imageData
  // }
}