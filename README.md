# Vue Image Upload and Resize
A Vue.js Plugin Component for client-side image upload with optional resizing and exif-based autorotate.

This plugin was created for the use in a webapp scenario where we had a large number of end users uploading camera photos from their mobile devices on partly low end data plans. The primary purpose is therefor _client-side resizing_ and if needed exif-based auto-rotation. It can however also be use simply as a file upload component.

Based on [ImageUploader] (https://github.com/rossturner/HTML5-ImageUploader) by Ross Turner. The plugin makes use of an optional dependency [JavaScript Canvas to Blob](https://github.com/blueimp/JavaScript-Canvas-to-Blob) (for blob output).

[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

## Demo
[![Edit Vue Image Upload and Resize ](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/mqnow97omj?module=%2Fsrc%2Fcomponents%2FHelloWorld.vue)


## Installation
### yarn
```bash
yarn add vue-image-upload-resize
```
### npm
```bash
npm install --save vue-image-upload-resize
```

### Usage

#### Global Registration
In script entry point
```js
import ImageUploader from 'vue-image-upload-resize'
Vue.use(ImageUploader);
```

#### Local Registration
In component
```js
import ImageUploader from 'vue-image-upload-resize'
export default {
  components: {
    ImageUploader
  },
  // ...
}
```


#### Using with Nuxt.js

Currently the componenet is tied to the `window` object, so it can't be server side rendered.
To get around this you need to install the componenet as a client side plugin.

<details><summary>Instructions</summary>
<p>

1) Create a new file: `plugins/vue-image-upload.js`, and add the following code:
```js
import Vue from 'vue'
import ImageUploader from 'vue-image-upload-resize'

Vue.use(ImageUploader)
```

2) In your `nuxt.config.js`, add the [client plugin](https://nuxtjs.org/api/configuration-plugins):

```js
export default {
  // ... other config
  plugins: [
    { src: '~/plugins/vue-image-upload.js', mode: 'client' },
  ]
}
```

3) When you use the componenent inside a page, make sure to wrap it in `<client-only>` tags (`<no-ssr>` in v < 2.9.0, [docs](https://nuxtjs.org/api/components-client-only/)).
```html
<template>
  <client-only>
    <image-uploader
      :debug="1"
    ></image-uploader>
 </client-only>
</template>
```

</p>
</details>



## As global script
```html
<script src="https://unpkg.com/vue-image-upload-resize"></script>
```
The global script automatically registers as a global componenet. See [public/demo.html](https://github.com/kartoteket/vue-image-upload-resize/blob/master/public/demo.html) for example use.


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
    :capture="false"
    accept="video/*,image/*"
    doNotResize="['gif', 'svg']"
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

#### id
The ID for the file input, required if more than one instance should be used on the same page.
* default fileInput
* type String

#### maxWidth
An integer in pixels for the maximum width allowed for uploaded images, selected images with a greater width than this value will be scaled down.
* type: Number
* default: 1024

#### maxHeight
An integer in pixels for the maximum height allowed for uploaded images, selected images with a greater height than this value will be scaled down.
* type: Number,
* default: 1024

#### maxSize
*NB Is broken, see https://github.com/rossturner/HTML5-ImageUploader/issues/13.*
A float value in megapixels (MP) for the maximum overall size of the image allowed for uploaded images, selected images with a greater size than this value will be scaled down before upload. If the value is null or is not specified, then maximum size restriction is not applied
* type: Number,
* default: null

#### quality
A float between 0 and 1.00 for the image quality to use in the resulting image data, around 0.9 is recommended.
* type: Number,
* default: 1.00

#### scaleRatio
Allows scaling down to a specified fraction of the original size. (Example: a value of 0.5 will reduce the size by half.) Accepts a decimal value between 0 and 1.
* type: Number,
* default: null

#### autoRotate
A boolean flag, if true then EXIF information from the image is parsed and the image is rotated correctly before upload. If false, then no processing is performed, and unwanted image flipping can happen. This functionality is based on the library [exif-js] https://github.com/exif-js/exif-js.
* type: Boolean,
* default: false

#### preview
A boolean flag to toogle an img-tag displaying the uploaded image. When set to false no img-tag is displayed.
* type: Boolean,
* default: true

#### outputFormat
Sets the desired format for the returned image. Available formats are 
- **string**  - image as base64 string.
- **info** - object with image info only [name, type, newWidth, newHeight, orgWidth, orgHeight, aspectRatio (as Float), modifiedTimestamp, modifiedDate].
- **verbose** - object with 'dataUrl' (image as base64 string), 'info' (image info) and 'exif' data (`null` if not available).
- **blob** - image as A Blob object. **NB: The *'blob'* format requires that the [blueimp-canvas-to-blob](https://github.com/blueimp/JavaScript-Canvas-to-Blob) library is loaded.** If not, a warning is echoed to the console.
- **file**  - unmodified uploaded File object.

* type: String,
* default: 'string'

#### className
Sets the desired class name for the input element
* type: String or Array
* default: 'fileinput'

#### capture
Sets an optional capture attribute (camera, user, environment) to the input element (only for mobile devices).
The "camera" value let's the browser decide which camera to use, while the "user" and "environment" values tell the browser to prefer the front and rear cameras, respectively. To also access the device gallery capture must be set to 'false'
* type: String
* default: false (off)

#### accept
Specifies the types of files that can be submitted through the file upload. The types can be valid file extension starting with the STOP character (e.g: ".gif, .jpg, .png") or wildcare file types (e.g. audio/*, video/*, image/*"). To specify more than one value, separate the values with a comma
* type: String
* default: 'image/*'

#### doNotResize
Specifies filetypes that will not be resized. Accepts an array of image's extension. If only 1 extension, it can be provided directly as a string.
* type String or Array
* default: null

#### debug
How much to write to the console. 0 = silent. 1 = quiet. 2 = loud
* type: Number,
* default: 0

### Events

#### @input
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

#### @onUpload
On start of upload.

#### @onComplete
On end of upload.



## Optional dependencies
If ```outformat="blob"``` the required libraby canvas-to-blob.min.js must be available. If the plugin is loaded with ```<script>```-tag in global scope, so must the relevant lilbrary:

#### index.html

```html
<script src="js/canvas-to-blob.min.js" async defer></script>
```

If loaded as module, npm handles all dependecies.

## Roadmap and todos
1. Progress report
2. Support multiple files
3. Implement completion callback
4. Propper unit testing of events
5. ~~Clean up scaffolding and project files~~
6. Exclude optional dependecies from package

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Compiles and minifies lib bundle
```
yarn run build-lib
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```
