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
 * Code based on ImageUploader (c) Ross Turner (https://github.com/rossturner/HTML5-ImageUploader).
 * Adapted for Vue by Svale Fossåskaret / Kartoteket with some modifications.
 *
 * Requires exif.js 2.3.0 (https://github.com/exif-js/exif-js) for JPEG autoRotate functions.
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

/* Dependecies */
import EXIF from '../utils/exif.js'
import { createScaledImage, scaleImage } from '../utils/images.js';
import { getHalfScaleCanvas, scaleCanvasWithAlgorithm } from '../utils/canvas.js'
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
    }
  },

  computed: {
    //@todo: obsolete
    hasExifLibrary: function() {
      return typeof EXIF !== 'undefined' && typeof EXIF.getData === 'function'
    },
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
    async handleFile(file) {
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
        const options = {
          autoRotate: this.autoRotate,
          hasExifLibrary: this.hasExifLibrary,
          maxWidth: this.maxWidth,
          maxHeight: this.maxHeight,
          maxSize: this.maxSize,
          scaleRatio: this.scaleRatio,
          dimensions: this.dimensions,
          quality: this.quality,
        }
          // imagePreview: this.imagePreview,
          // onScale: this.onScale,
        const { img, orientation } = await createScaledImage(file, options)
        const imageData = scaleImage(img, file, orientation, options)
        if (this.preview) {
          this.imagePreview = imageData;
        }

        this.emitEvent(this.formatOutput(imageData))
        this.emitComplete()
      }
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
        }

        // @todo: cache and reuse exifdata if autoRotate is used
        EXIF.getData(this.currentFile, function() {
          if (Object.keys(this.exifdata).length > 0) {
            data.exif = this.exifdata
            return data
          }
        })

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
    window.debugLevel = 2
    this.log('Initialised ImageUploader')
  },
}
</script>
