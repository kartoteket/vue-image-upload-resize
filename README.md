# Vue Image Upload and Resize
A Vue.js Plugin Component for client-side image upload with optional resizing and exif-based autorotate.

Based on [ImageUploader] (https://github.com/rossturner/HTML5-ImageUploader) by Ross Turner. The plugin makes use of two optional dependencies: [Exif.js](https://github.com/exif-js/exif-js) (for autorotate)
and [JavaScript Canvas to Blob](https://github.com/blueimp/JavaScript-Canvas-to-Blob) (for blob output).

[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)


## Usage


### Install and import as npm module
```bash
npm install --save vue-image-upload-resize
```
```js
import { ImageUploader } from 'vue-image-upload-resize'
```
### ... or load and register as global script
```html
<script src="https://unpkg.com/vue-image-upload-resize"></script>
```
```js
var ImageUploader = VueImageUploadResize.ImageUploader;
```

## Add as component
```js
export default {
  (...)
  components: {
    ImageUploader
  },
  (...)
}
```

## Markup

```html
<template>
  <image-uploader
    :debug="1"
    :maxWidth="512"
    :quality="0.7"
    :autoRotate=true
    outputFormat="verbose"
    :preview=false
    :className="['fileinput', { 'fileinput--loaded' : hasImage }]"
    capture="environment"
    @input="setImage"
    @onUpload="startImageResize"
    @onComplete="endImageResize"
  ></image-uploader>
</template>
```

## Input label slot
An optional label tag can be added as a slot

### Example
```html
<image-uploader ... >
      <label for="fileInput" slot="upload-label">
        <figure>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <path class="path1" d="M9.5 19c0 3.59 2.91 6.5 6.5 6.5s6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5-6.5 2.91-6.5 6.5zM30 8h-7c-0.5-2-1-4-3-4h-8c-2 0-2.5 2-3 4h-7c-1.1 0-2 0.9-2 2v18c0 1.1 0.9 2 2 2h28c1.1 0 2-0.9 2-2v-18c0-1.1-0.9-2-2-2zM16 27.875c-4.902 0-8.875-3.973-8.875-8.875s3.973-8.875 8.875-8.875c4.902 0 8.875 3.973 8.875 8.875s-3.973 8.875-8.875 8.875zM30 14h-4v-2h4v2z"></path>
          </svg>
        </figure>
        <span class="upload-caption">{{ hasImage ? 'Replace' : 'Upload' }}</span>
      </label>
  </image-uploader>

```

## Settings

### Props
- **id**
The ID for the file input, required if more than one instance should be used on the same page.     
    * @default fileInput
    * @type {String}
     
- **maxWidth**
An integer in pixels for the maximum width allowed for uploaded images, selected images with a greater width than this value will be scaled down before upload.
	* type: Number
	* default: 1024

- **maxHeight**
An integer in pixels for the maximum height allowed for uploaded images, selected images with a greater height than this value will be scaled down before upload.
	* type: Number,
	* default: 1024

- **maxSize**
*NB Is broken, see https://github.com/rossturner/HTML5-ImageUploader/issues/13.*
A float value in megapixels (MP) for the maximum overall size of the image allowed for uploaded images, selected images with a greater size than this value will be scaled down before upload. If the value is null or is not specified, then maximum size restriction is not applied
	* type: Number,
   * default: null

- **quality**
A float between 0 and 1.00 for the image quality to use in the resulting image data, around 0.9 is recommended.
   * type: Number,
   * default: 1.00

- **scaleRatio** Allows scaling down to a specified fraction of the original size. (Example: a value of 0.5 will reduce the size by half.) Accepts a decimal value between 0 and 1.
   * type: Number,
   * default: null

- **autoRotate**
A boolean flag, if true then EXIF information from the image is parsed and the image is rotated correctly before upload. If false, then no processing is performed, and unwanted image flipping can happen. **NB: Requires that the [exif-js](https://github.com/exif-js/exif-js) library is loaded.** If not, a warning is echoed to the console.
   * type: Boolean,
   * default: false

- **preview**
A boolean flag to toogle an img-tag displaying the uploaded image. When set to false no img-tag is displayed.
   * type: Boolean,
   * default: true

- **outputFormat**
Sets the desired format for the returned image. Available formats are 'string' (base64), verbose (object) or 'blob' (object). **NB: The *'blob'* format requires that the [blueimp-canvas-to-blob](https://github.com/blueimp/JavaScript-Canvas-to-Blob) library is loaded.** If not, a warning is echoed to the console.
   * type: String,
   * default: 'string'

- **className**
Sets the desired class name for the input element
   * type: String or Array
   * default: 'fileinput'

- **capture**
Sets an optional capture attribute (camera, user, environment) to the input element.
The "camera" value (or no value) let's the browser decide which camera to use, while the "user" and "environment" values tell the browser to prefer the front and rear cameras, respectively.
   * type: String
   * default: empty (off)

- **debug**
How much to write to the console. 0 = silent. 1 = quite. 2 = loud
   * type: Number,
   * default: 0

### Events

- **@input**
Returns the processed image in requested outputformat. From this event you can add optional hooks.

```html
  <image-uploader @input="setImage"></image-uploader>
```

```js
  methods: {
    setImage: function (file) {
      this.hasImage = true
      this.image = file
    }
  }

```

- **@onUpload**
On start of upload.

- **@onComplete**
On end of upload.



## Optional dependencies
If ```autoRotate=true``` and/or ```outformat="blob"``` the required librabries - exif.js and  canvas-to-blob.min.js - must be available. If the plugin is loaded with ```<script>```-tag in global scope, so must the relevant lilbraries:

#### index.html

```html
<script src="js/exif.js" async defer></script>
<script src="js/canvas-to-blob.min.js" async defer></script>
```

If loaded as module, npm handles all dependecies.


## Development

### Launch visual tests

```bash
npm run dev
```
### Watch
Run build task on file change (convenient together with npm link in local dev)

```bash
npm run watch
```

### Build
Bundle the js and css of to the `dist` folder:

```bash
npm run build
```

## Todo
1. Progress report
2. Support multiple files
3. Implement completion callback
4. Propper unit testing with https://github.com/visionmedia/supertest
5. Clean up scaffolding and project files


## License

[MIT](http://opensource.org/licenses/MIT)
