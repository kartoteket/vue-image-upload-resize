/*!
 * vue-image-upload-resize v1.1.6
 * Based on ImageUploader (c) Ross Turner (https://github.com/rossturner/HTML5-ImageUploader)
 * Adapted by (c) 2018 Svale Fossåskaret
 * Released under the MIT License.
 */

 if(typeof EXIF === 'undefined'){    var EXIF = []; }
 if(typeof dataURLtoBlob == 'undefined'){   var dataURLtoBlob = []; }

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('exif-js'), require('blueimp-canvas-to-blob')) :
	typeof define === 'function' && define.amd ? define(['exports', 'exif-js', 'blueimp-canvas-to-blob'], factory) :
	(factory((global.VueImageUploadResize = global.VueImageUploadResize || {}),global.EXIF,global.dataURLtoBlob));
}(this, (function (exports,EXIF,dataURLtoBlob) { 'use strict';

EXIF = 'default' in EXIF ? EXIF['default'] : EXIF;
dataURLtoBlob = 'default' in dataURLtoBlob ? dataURLtoBlob['default'] : dataURLtoBlob;

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
 * 2. Multiple Files
 * 3. Support custom completion callback
 * 4. Propper unit testing with https://github.com/visionmedia/supertest
 * 5. Clean up scaffolding and project files
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
/* global EXIF:true, dataURLtoBlob:true */
var ImageUploader = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('img',{directives:[{name:"show",rawName:"v-show",value:(_vm.imagePreview),expression:"imagePreview"}],staticClass:"img-preview",attrs:{"src":_vm.imagePreview,"width":"100"}}),_vm._v(" "),_c('input',{class:_vm.className,attrs:{"id":_vm.id,"type":"file","accept":"image/*","capture":_vm.capture},on:{"change":_vm.uploadFile}}),_vm._t("upload-label")],2)},staticRenderFns: [],
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
      default: 'fileInput'
    },

    /**
     * An integer in pixels for the maximum width allowed for uploaded images, selected images with a greater width than this value will be scaled down before upload.
     * @default 1024
     * @type {Number}
     */
    maxWidth: {
      type: Number,
      default: 1024
    },

    /**
     * An integer in pixels for the maximum height allowed for uploaded images, selected images with a greater height than this value will be scaled down before upload.
     * @default 1024
     * @type {Number}
     */
    maxHeight: {
      type: Number,
      default: 1024
    },

    /**
     * TODO: Does not make sens to me
     * A float value in megapixels (MP) for the maximum overall size of the image allowed for uploaded images, selected images with a greater size than this value will be scaled down before upload. If the value is null or is not specified, then maximum size restriction is not applied
     * @default null
     * @type {Number}
     */
    maxSize: {
      type: Number,
      default: null
    },

    /**
     * A float between 0 and 1.00 for the image quality to use in the resulting image data, around 0.9 is recommended.
     * @default 1.00
     * @type {Number}
     */
    quality: {
      type: Number,
      default: 1.00
    },

    /**
     * Allows scaling down to a specified fraction of the original size. (Example: a value of 0.5 will reduce the size by half.) Accepts a decimal value between 0 and 1.
     * @default null
     * @type {Number}
     */
    scaleRatio: {
      type: Number,
      default: null
    },

    /**
     * A boolean flag, if true then EXIF information from the image is parsed and the image is rotated correctly before upload. If false, then no processing is performed, and unwanted image flipping can happen.
     * @default false
     * @type {Boolean}
     */
    autoRotate: {
      type: Boolean,
      default: false
    },

    /**
     * A boolean flag to toogle an img-tag displaying the uploaded image. When set to false no img-tag is displayed
     * @default true
     * @type {Boolean}
     */
    preview: {
      type: Boolean,
      default: true
    },

    /**
     * Sets the desired format for the returned image. Available formats are
     * 'string' (base64), verbose (object) or 'blob' (object)
     * @default {base64}
     * @type {String}
     */
    outputFormat: {
      type: String,
      default: 'string'
    },

    /**
     * Sets the desired class name for the input element
     * @default {fileinput}
     * @type {String or Array}
     */
    className: {
      type: [String, Array],
      default: 'fileinput'
    },

    /**
     * Sets an optional capture attribute. (camera, user, environment)
     * @default empty
     * @type {String}
     */
    capture: {
      type: [String],
      default: null
    },

    /**
     * How much to write to the console. 0 = silent. 1 = quite. 2 = loud
     * @default false
     * @type {Boolean}
     */
    debug: {
      type: Number,
      default: 0
    }
  },

  data: function data () {
    return {
      imagePreview: null
    }
  },

  methods: {
    /**
     * Get file from input
     * @param  {object} event
     */
    uploadFile: function uploadFile (e) {
      var file = e.target.files && e.target.files.length ? e.target.files[0] : null;
      if (file) {
        this.emitLoad();
        this.handleFile(file, this.emitComplete);
      }
    },

    /**
     * Emit event with output
     * @param  {mixed} output   the resized image. type can be simple dataUrl string, verbose object or Blob instance
     * @return {[type]}        [description]
     */
    emitEvent: function emitEvent (output) {
      if (this.debug > 1) {
        console.log('emitEvent() is called with output:');
        console.log(output);
      }

      this.$emit('input', output);
      this.$emit('change', output);
    },

    emitLoad: function emitLoad () {
      this.$emit('onUpload');
    },

    emitComplete: function emitComplete () {
      this.$emit('onComplete');
    },

    /**
     * Handels the file manipulation on upload
     * @param  {File}     file The current original uploaded file
     * @param  {function} completionCallback Not implemted yet
     * @return {}         nada
     */
    handleFile: function handleFile (file, completionCallback) {
      if (this.debug > 1) {
        console.log('handleFile() is called with file:');
        console.log(file);
      }

      this.currentFile = file;

      var that = this;
      var img = document.createElement('img');
      var reader = new window.FileReader();

      reader.onload = function (e) {
        if (that.debug > 1) {
          console.log('reader.onload() is triggered');
        }

        img.src = e.target.result;
        img.onload = function () {
          if (that.debug > 1) {
            console.log('img.onload() is triggered');
          }

          // Rotate image first if required
          if (that.autoRotate) {
            if (typeof EXIF === 'undefined') {
              console.warn('Missing EXIF library! exif-js.js must be loaded to use autoRotate');
              console.warn('Continuing without rotation');
              that.scaleImage(img, completionCallback);
            } else {
              if (that.debug) {
                console.log('ImageUploader: detecting image orientation...');
              }

              if ((typeof EXIF.getData === 'function') && (typeof EXIF.getTag === 'function')) {
                EXIF.getData(img, function () {
                  var orientation = EXIF.getTag(this, 'Orientation');
                  if (that.debug) {
                    console.log('ImageUploader: image orientation from EXIF tag = ' + orientation);
                  }
                  that.scaleImage(img, completionCallback, orientation);
                });
              } else {
                console.error('ImageUploader: can\'t read EXIF data, the Exif.js library not found');
                that.scaleImage(img, completionCallback);
              }
            }
          } else {
            if (that.debug) {
              console.log('No autoRotate');
            }
            that.scaleImage(img, completionCallback);
          }
        };
      };

      reader.readAsDataURL(file);
    },

    /**
     * Performance orientation and scaling logic
     * @param  {[type]} img                [description]
     * @param  {[type]} completionCallback [description]
     * @param  {[type]} orientation        [description]
     * @return {[type]}                    [description]
     */
    scaleImage: function scaleImage (img, completionCallback, orientation) {
      var this$1 = this;

      if (this.debug > 1) {
        console.log('scaleImage() is called');
      }

      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      ctx.save();

      // Good explanation of EXIF orientation is here http://www.daveperrett.com/articles/2012/07/28/exif-orientation-handling-is-a-ghetto/
      var width = canvas.width;
      var styleWidth = canvas.style.width;
      var height = canvas.height;
      var styleHeight = canvas.style.height;
      if (typeof orientation === 'undefined') {
        orientation = 1;
      }
      if (orientation) {
        if (orientation > 4) {
          canvas.width = height;
          canvas.style.width = styleHeight;
          canvas.height = width;
          canvas.style.height = styleWidth;
        }
        switch (orientation) {
          case 2:
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            break
          case 3:
            ctx.translate(width, height);
            ctx.rotate(Math.PI);
            break
          case 4:
            ctx.translate(0, height);
            ctx.scale(1, -1);
            break
          case 5:
            ctx.rotate(0.5 * Math.PI);
            ctx.scale(1, -1);
            break
          case 6:
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(0, -height);
            break
          case 7:
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(width, -height);
            ctx.scale(-1, 1);
            break
          case 8:
            ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-width, 0);
            break
        }
      }
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      // Let's find the max available width for scaled image
      var ratio = canvas.width / canvas.height;
      var mWidth = Math.min(this.maxWidth, ratio * this.maxHeight);

      // suggested re-write by https://github.com/ryancramerdesign
      // https://github.com/rossturner/HTML5-ImageUploader/issues/13
      if (this.maxSize > 0 && (this.maxSize < (canvas.width * canvas.height) / 1000000)) {
        var mSize = Math.floor(Math.sqrt(this.maxSize * ratio) * 1000);
        mWidth = mWidth > 0 ? Math.min(mWidth, mSize) : mSize;
      }

      if (this.scaleRatio) {
        mWidth = Math.min(mWidth, Math.floor(this.scaleRatio * canvas.width));
      }

      if (this.debug) {
        console.log('ImageUploader: original image size = ' + canvas.width + ' X ' + canvas.height);
        console.log('ImageUploader: scaled image size = ' + mWidth + ' X ' + Math.floor(mWidth / ratio));
      }

      if (mWidth <= 0) {
        mWidth = 1;
        console.warning('ImageUploader: image size is too small');
      }

      while (canvas.width >= (2 * mWidth)) {
        canvas = this$1.getHalfScaleCanvas(canvas);
      }

      if (canvas.width > mWidth) {
        canvas = this.scaleCanvasWithAlgorithm(canvas, mWidth);
      }

      // suggested re-write by https://github.com/ryancramerdesign
      // https://github.com/rossturner/HTML5-ImageUploader/issues/13
      var quality = this.currentFile.type === 'image/jpeg' ? this.quality : 1.0;
      var imageData = canvas.toDataURL(this.currentFile.type, quality);
      if (typeof this.onScale === 'function') {
        this.onScale(imageData);
      }

      if (this.debug > 1) {
        console.log('New ImageData is ready. Set Preview, emitEvent and trigger optional callback ');
      }

      // Display preview of the new image
      if (this.preview) {
        this.imagePreview = imageData;
      }

      // Return the new image
      // this.emitEvent(this.currentFile) // DEBUG
      this.emitEvent(this.formatOutput(imageData));

      // complete
      completionCallback();
      // this.performUpload(imageData, completionCallback)
    },

    scaleCanvasWithAlgorithm: function scaleCanvasWithAlgorithm (canvas, maxWidth) {
      var scaledCanvas = document.createElement('canvas');
      var scale = maxWidth / canvas.width;

      scaledCanvas.width = canvas.width * scale;
      scaledCanvas.height = canvas.height * scale;

      var srcImgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      var destImgData = scaledCanvas.getContext('2d').createImageData(scaledCanvas.width, scaledCanvas.height);

      this.applyBilinearInterpolation(srcImgData, destImgData, scale);

      scaledCanvas.getContext('2d').putImageData(destImgData, 0, 0);

      return scaledCanvas
    },

    /* eslint-disable camelcase */
    applyBilinearInterpolation: function applyBilinearInterpolation (srcCanvasData, destCanvasData, scale) {
      function inner (f00, f10, f01, f11, x, y) {
        var un_x = 1.0 - x;
        var un_y = 1.0 - y;
        return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y)
      }
      var i, j;
      var iyv, iy0, iy1, ixv, ix0, ix1;
      var idxD, idxS00, idxS10, idxS01, idxS11;
      var dx, dy;
      var r, g, b, a;
      for (i = 0; i < destCanvasData.height; ++i) {
        iyv = i / scale;
        iy0 = Math.floor(iyv);
        // Math.ceil can go over bounds
        iy1 = (Math.ceil(iyv) > (srcCanvasData.height - 1) ? (srcCanvasData.height - 1) : Math.ceil(iyv));
        for (j = 0; j < destCanvasData.width; ++j) {
          ixv = j / scale;
          ix0 = Math.floor(ixv);
          // Math.ceil can go over bounds
          ix1 = (Math.ceil(ixv) > (srcCanvasData.width - 1) ? (srcCanvasData.width - 1) : Math.ceil(ixv));
          idxD = (j + destCanvasData.width * i) * 4;
          // matrix to vector indices
          idxS00 = (ix0 + srcCanvasData.width * iy0) * 4;
          idxS10 = (ix1 + srcCanvasData.width * iy0) * 4;
          idxS01 = (ix0 + srcCanvasData.width * iy1) * 4;
          idxS11 = (ix1 + srcCanvasData.width * iy1) * 4;
          // overall coordinates to unit square
          dx = ixv - ix0;
          dy = iyv - iy0;
          // I let the r, g, b, a on purpose for debugging
          r = inner(srcCanvasData.data[idxS00], srcCanvasData.data[idxS10], srcCanvasData.data[idxS01], srcCanvasData.data[idxS11], dx, dy);
          destCanvasData.data[idxD] = r;

          g = inner(srcCanvasData.data[idxS00 + 1], srcCanvasData.data[idxS10 + 1], srcCanvasData.data[idxS01 + 1], srcCanvasData.data[idxS11 + 1], dx, dy);
          destCanvasData.data[idxD + 1] = g;

          b = inner(srcCanvasData.data[idxS00 + 2], srcCanvasData.data[idxS10 + 2], srcCanvasData.data[idxS01 + 2], srcCanvasData.data[idxS11 + 2], dx, dy);
          destCanvasData.data[idxD + 2] = b;

          a = inner(srcCanvasData.data[idxS00 + 3], srcCanvasData.data[idxS10 + 3], srcCanvasData.data[idxS01 + 3], srcCanvasData.data[idxS11 + 3], dx, dy);
          destCanvasData.data[idxD + 3] = a;
        }
      }
    },

    getHalfScaleCanvas: function getHalfScaleCanvas (canvas) {
      var halfCanvas = document.createElement('canvas');
      halfCanvas.width = canvas.width / 2;
      halfCanvas.height = canvas.height / 2;

      halfCanvas.getContext('2d').drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);

      return halfCanvas
    },

    /**
     * Sets the format of the component output
     * @param  {string} imageData  dataUrl
     * @return {mixed}             Either simple dataUrl string or
     *                                    object with dataURl and metadata or
     *                                    blob
     */
    formatOutput: function formatOutput (imageData) {
      if (this.debug) {
        console.log('ImageUploader: outputFormat: ' + this.outputFormat);
      }

      if (this.outputFormat === 'blob') {
        if (typeof dataURLtoBlob === 'undefined') {
          console.warn('Missing library! blueimp-canvas-to-blob.js must be loaded to output as "blob"');
          console.warn('Falling back to default base64 dataUrl');
          return imageData
        }
        return dataURLtoBlob(imageData)
      }

      if (this.outputFormat === 'verbose') {
        return {
          dataUrl: imageData,
          name: this.currentFile.name,
          lastModified: this.currentFile.lastModified,
          lastModifiedDate: this.currentFile.lastModifiedDate
        }
      }

      // simple base64 dataUrl string by default
      return imageData
    }
  },

  created: function created () {
    if (this.debug) {
      console.log('Initialised ImageUploader');
    }
  }
};

function plugin (Vue) {
  Vue.component('image-uploader', ImageUploader);
}

// Install by default if using the script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

var version = '1.1.6';

exports['default'] = plugin;
exports.ImageUploader = ImageUploader;
exports.version = version;

Object.defineProperty(exports, '__esModule', { value: true });

})));
