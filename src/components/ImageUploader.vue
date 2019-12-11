<template>
  <div>
    <img v-show="imagePreview" :src="imagePreview" class="img-preview" width="400" /> <input :id="id" :class="className" type="file" @change="uploadFile" :accept="accept" :capture="capture" />
    <slot name="upload-label"></slot>
  </div>
</template>

<script>
/**
 * vue-ImageUploader: a to-the-point vue-component for client-side image upload with resizing of images (JPG, PNG, GIF)
 *
 * Code based on ImageUploader (c) Ross Turner (https://github.com/rossturner/HTML5-ImageUploader) and
 * exif.js (https://github.com/exif-js/exif-js) for JPEG autoRotate functions
 * Adapted for Vue by Svale Fossåskaret / Kartoteket with some modifications.
 *
 *
 * TODO Items:
 * 1. Progress Report
 * 2. Multiple Files / async handling
 * 3. Support custom completion callback
 * 4. Propper unit testing with https://github.com/visionmedia/supertest
 *
 * LICENSE (from original ImageUploader files by Ross Turner):
 *
 * Copyright (c) 2012 Ross Turner and contributors (https://github.com/zsinj)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/

import EXIF from '../utils/exif.js'
import dataURLtoBlob from 'blueimp-canvas-to-blob'

export default {
  name: 'image-uploader',

  props: {
    /**
     * The ID for the file input, required if more than one instance should be used on the same page.
     *
     * @default fileInput
     * @type {String}
     */
    id: {
      type: String,
      default: 'fileInput',
    },

    /**
     * An integer in pixels for the maximum width allowed for uploaded images, selected images with a greater width than this value will be scaled down before upload.
     * @default 1024
     * @type {Number}
     */
    maxWidth: {
      type: Number,
      default: 1024,
    },

    /**
     * An integer in pixels for the maximum height allowed for uploaded images, selected images with a greater height than this value will be scaled down before upload.
     * @default 1024
     * @type {Number}
     */
    maxHeight: {
      type: Number,
      default: 1024,
    },

    /**
     * TODO: Does not make sens to me
     * A float value in megapixels (MP) for the maximum overall size of the image allowed for uploaded images, selected images with a greater size than this value will be scaled down before upload. If the value is null or is not specified, then maximum size restriction is not applied
     * @default null
     * @type {Number}
     */
    maxSize: {
      type: Number,
      default: null,
    },

    /**
     * A float between 0 and 1.00 for the image quality to use in the resulting image data, around 0.9 is recommended.
     * @default 1.00
     * @type {Number}
     */
    quality: {
      type: Number,
      default: 1.0,
    },

    /**
     * Allows scaling down to a specified fraction of the original size. (Example: a value of 0.5 will reduce the size by half.) Accepts a decimal value between 0 and 1.
     * @default null
     * @type {Number}
     */
    scaleRatio: {
      type: Number,
      default: null,
    },

    /**
     * A boolean flag, if true then EXIF information from the image is parsed and the image is rotated correctly before upload. If false, then no processing is performed, and unwanted image flipping can happen.
     * @default false
     * @type {Boolean}
     */
    autoRotate: {
      type: Boolean,
      default: false,
    },

    /**
     * A boolean flag to toogle an img-tag displaying the uploaded image. When set to false no img-tag is displayed
     * @default true
     * @type {Boolean}
     */
    preview: {
      type: Boolean,
      default: true,
    },

    /**
     * Sets the desired format for the returned image. Available formats are
     * 'string' (base64), 'verbose' (object), 'blob' (object), 'info' (object), 'file' (unmodified File object)
     * @default {string}
     * @type {String}
     */
    outputFormat: {
      type: String,
      default: 'string',
    },

    /**
     * Sets the desired class name for the input element
     * @default {fileinput}
     * @type {String or Array}
     */
    className: {
      type: [String, Array],
      default: 'fileinput',
    },

    /**
     * Sets an optional capture attribute. (false, camera, user, environment)
     * @default empty
     * @type [String or Boolean]
     */
    capture: {
      type: [String, Boolean],
      default: false,
    },

    /**
     * Sets the accept attribute, in case the same input can accept other files
     * Shoub be a comma seperated string, eg 'audio/*,video/*,image/*'
     * @default image/*
     * @type {String}
     */
    accept: {
      type: String,
      default: 'image/*',
    },

    /**
     * An array of image's extensions that will not be resized (['gif', 'svg'])
     * If only 1 extension, it can be provided directly as a stringEg ('gif')
     * Disable all resizing with a catch all ('*')
     * If not resized, the returned output will always be the unmodifed File object
     * @default []
     * @type {String or Array}
     */
    doNotResize: {
      type: [String, Array],
      default: () => [],
    },

    /**
     * How much to write to the console. 0 = silent. 1 = quite. 2 = loud
     * @default false
     * @type {Boolean}
     */
    debug: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      imagePreview: null,
      currentFile: {},
      dimensions: {},
      exifData: {},
    }
  },

  methods: {
    /**
     * Get file from input
     * @param  {object} event
     */
    uploadFile(e) {
      const file = e.target.files && e.target.files.length ? e.target.files[0] : null
      if (file) {
        this.emitLoad()
        this.handleFile(file)
      }
    },

    /**
     * Emit event with output
     * @param  {mixed} output - The resized image. type can be simple dataUrl string, verbose object or Blob instance
     */
    emitEvent(output) {
      this.log('emitEvent() is called with output:', 2, output)
      this.$emit('input', output)
      this.$emit('change', output)
    },

    emitLoad() {
      this.$emit('onUpload')
    },

    emitComplete() {
      this.$emit('onComplete')
    },

    /**
     * Handels the file manipulation on upload
     * @param  {File}     file The current original uploaded file
     * @return {}         nada (yet)
     */
    handleFile(file) {
      this.log('handleFile() is called with file:', 2, file)
      this.currentFile = file

      const mimetype = file.type.split('/') // NB: Not supprted by Safari on iOS !??! @todo: TEST!
      const isImage = mimetype[0] === 'image'
      const doNotResize = typeof this.doNotResize === 'string' ? [this.doNotResize] : this.doNotResize // cast to array

      // Don't resize if not image or doNotResize is set
      if (!isImage || doNotResize.includes('*') || doNotResize.includes(mimetype[1])) {
        this.log('No Resize, return file directly')
        this.emitEvent(file) // does NOT respect the output format prop
        this.emitComplete()
      } else {
        const that = this
        const img = document.createElement('img')
        const reader = new window.FileReader()

        reader.onload = function(e) {
          that.log('reader.onload() is triggered', 2)

          img.src = e.target.result
          img.onload = function() {
            that.log('img.onload() is triggered', 2)

            // this extracts exifdata if available. Returns an empty object if not
            EXIF.getData(img, function() {
              that.exifData = this.exifdata
              if (Object.keys(that.exifData).length === 0) {
                that.log('ImageUploader: exif data found and extracted', 2)
              }
            })

            that.scaleImage(img, that.exifData.Orientation)
          }
        }
        reader.readAsDataURL(file)
      }
    },

    /**
     * Performance orientation and scaling logic
     * @param  {HTMLElement} img -  A document img element containing the uploaded file as a base764 encoded string as source
     * @param  {int} [orientation = 1] - Exif-extracted orientation code
     */
    scaleImage(img, orientation = 1) {
      this.log('scaleImage() is called', 2)

      let canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.save()

      // Good explanation of EXIF orientation is here http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
      if (this.autoRotate && orientation > 1) {
        this.log('ImageUploader: rotating image as per EXIF orientation tag = ' + orientation)
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
        switch (orientation) {
          case 2:
            ctx.translate(width, 0)
            ctx.scale(-1, 1)
            break
          case 3:
            ctx.translate(width, height)
            ctx.rotate(Math.PI)
            break
          case 4:
            ctx.translate(0, height)
            ctx.scale(1, -1)
            break
          case 5:
            ctx.rotate(0.5 * Math.PI)
            ctx.scale(1, -1)
            break
          case 6:
            ctx.rotate(0.5 * Math.PI)
            ctx.translate(0, -height)
            break
          case 7:
            ctx.rotate(0.5 * Math.PI)
            ctx.translate(width, -height)
            ctx.scale(-1, 1)
            break
          case 8:
            ctx.rotate(-0.5 * Math.PI)
            ctx.translate(-width, 0)
            break
        }
      }
      ctx.drawImage(img, 0, 0)
      ctx.restore()

      // Let's find the max available width for scaled image
      const ratio = canvas.width / canvas.height
      let mWidth = Math.min(this.maxWidth, ratio * this.maxHeight)

      // suggested re-write by https://github.com/ryancramerdesign
      // https://github.com/rossturner/HTML5-ImageUploader/issues/13
      if (this.maxSize > 0 && this.maxSize < (canvas.width * canvas.height) / 1000000) {
        const mSize = Math.floor(Math.sqrt(this.maxSize * ratio) * 1000)
        mWidth = mWidth > 0 ? Math.min(mWidth, mSize) : mSize
      }

      if (this.scaleRatio) {
        mWidth = Math.min(mWidth, Math.floor(this.scaleRatio * canvas.width))
      }

      // store dimensions
      this.dimensions.orgWidth = canvas.width
      this.dimensions.orgHeight = canvas.height
      this.dimensions.width = mWidth
      this.dimensions.height = Math.floor(mWidth / ratio)

      this.log('ImageUploader: original image size = ' + canvas.width + ' X ' + canvas.height)
      this.log('ImageUploader: scaled image size = ' + mWidth + ' X ' + Math.floor(mWidth / ratio))

      if (mWidth <= 0) {
        mWidth = 1
        console.warning('ImageUploader: image size is too small')
      }

      // simple resize with a 2:1 ratio
      while (canvas.width >= 2 * mWidth) {
        canvas = this.getHalfScaleCanvas(canvas)
      }

      // When factor less than 2:1 remains, finish up with alogorithm
      if (canvas.width > mWidth) {
        canvas = this.scaleCanvasWithAlgorithm(canvas, mWidth)
      }

      // suggested re-write by https://github.com/ryancramerdesign
      // https://github.com/rossturner/HTML5-ImageUploader/issues/13
      const quality = this.currentFile.type === 'image/jpeg' ? this.quality : 1.0
      const imageData = canvas.toDataURL(this.currentFile.type, quality)
      if (typeof this.onScale === 'function') {
        this.onScale(imageData)
      }

      this.log('New ImageData is ready', 2)

      // Display preview of the new image
      if (this.preview) {
        this.imagePreview = imageData
      }

      // Return the new image
      // this.emitEvent(this.currentFile) // DEBUG
      this.emitEvent(this.formatOutput(imageData))

      this.emitComplete()
    },

    /**
     * Scale Canvas. Scales the
     * @param {HTMLElement} canvas - canvas element before finale resize
     * @param {int} maxWidth - max image width
     * @returns {HTMLElement} - canvas resized to scale
     */
    scaleCanvasWithAlgorithm(canvas, maxWidth) {
      const scaledCanvas = document.createElement('canvas')
      const scale = maxWidth / canvas.width

      scaledCanvas.width = canvas.width * scale
      scaledCanvas.height = canvas.height * scale

      const srcImgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
      const destImgData = scaledCanvas.getContext('2d').createImageData(scaledCanvas.width, scaledCanvas.height)

      this.applyBilinearInterpolation(srcImgData, destImgData, scale)

      scaledCanvas.getContext('2d').putImageData(destImgData, 0, 0)

      return scaledCanvas
    },

    /**
     * Interpolation
     * @param  {ImageData} srcCanvasData - Pixel data of source canvas
     * @param  {ImageData} destCanvasData - Pixel data of destionation canvas
     * @param  {int} scale - Resize scale (max width / original width)
     * @author http://web.archive.org/web/20120123142531/http://www.philou.ch/js-bilinear-interpolation.html
     */
    applyBilinearInterpolation(srcCanvasData, destCanvasData, scale) {
      function inner(f00, f10, f01, f11, x, y) {
        const un_x = 1.0 - x
        const un_y = 1.0 - y
        return f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y
      }
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
          r = inner(srcCanvasData.data[idxS00], srcCanvasData.data[idxS10], srcCanvasData.data[idxS01], srcCanvasData.data[idxS11], dx, dy)
          destCanvasData.data[idxD] = r

          g = inner(srcCanvasData.data[idxS00 + 1], srcCanvasData.data[idxS10 + 1], srcCanvasData.data[idxS01 + 1], srcCanvasData.data[idxS11 + 1], dx, dy)
          destCanvasData.data[idxD + 1] = g

          b = inner(srcCanvasData.data[idxS00 + 2], srcCanvasData.data[idxS10 + 2], srcCanvasData.data[idxS01 + 2], srcCanvasData.data[idxS11 + 2], dx, dy)
          destCanvasData.data[idxD + 2] = b

          a = inner(srcCanvasData.data[idxS00 + 3], srcCanvasData.data[idxS10 + 3], srcCanvasData.data[idxS01 + 3], srcCanvasData.data[idxS11 + 3], dx, dy)
          destCanvasData.data[idxD + 3] = a
        }
      }
    },

    /**
     * getHalfScaleCanvas - return a canvas divided by 2
     * @param  {HTMLElement} canvas - input document canvas element
     * @returns  {HTMLElement} half of input canvas
     */
    getHalfScaleCanvas(canvas) {
      const halfCanvas = document.createElement('canvas')
      halfCanvas.width = canvas.width / 2
      halfCanvas.height = canvas.height / 2

      halfCanvas.getContext('2d').drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height)

      return halfCanvas
    },

    /**
     * Sets the format of the component output
     * @param  {string} imageData  dataUrl
     * @return {mixed}             Either simple dataUrl string or
     *                                    object with dataURl and metadata or
     *                                    blob or
     *                                    file
     */
    formatOutput(imageData) {
      this.log('ImageUploader: outputFormat: ' + this.outputFormat)

      if (this.outputFormat === 'file') {
        return this.currentFile
      }

      if (this.outputFormat === 'blob') {
        if (typeof dataURLtoBlob === 'undefined') {
          console.warn('Missing library! blueimp-canvas-to-blob.js must be loaded to output as "blob"')
          console.warn('Falling back to default base64 dataUrl')
          return imageData
        }
        return dataURLtoBlob(imageData)
      }

      const info = {
        name: this.currentFile.name,
        type: this.currentFile.type,
        // size: this.currentFile.size,
        newWidth: this.dimensions.width,
        newHeight: this.dimensions.height,
        orgWidth: this.dimensions.orgWidth,
        orgHeight: this.dimensions.orgHeight,
        aspectRatio: Math.round((this.dimensions.width / this.dimensions.height) * 100) / 100, //as Float
        modifiedTimestamp: this.currentFile.lastModified,
        modifiedDate: this.currentFile.lastModifiedDate,
      }

      // return just info
      if (this.outputFormat === 'info') {
        return info
      }

      if (this.outputFormat === 'verbose') {
        const data = {
          dataUrl: imageData,
          info,
          exif: Object.keys(this.exifData).length > 0 ? this.exifData : null,
        }
        return data
      }

      // simple base64 dataUrl string by default
      return imageData
    },

    /**
     * Debug logger to console
     * @param  {string} msg - Message to console
     * @param  {int} level - Debug level to output
     * @param  {mixed} details - Extra debug details
     */
    log(msg, level = 1, details = null) {
      if (this.debug >= level) {
        // eslint-disable-next-line
        console.info(msg)
        if (details) {
          // eslint-disable-next-line
          console.info(details)
        }
      }
    },
  },

  created() {
    this.log('Initialised ImageUploader')
  },
}
</script>
