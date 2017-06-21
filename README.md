# Vue Image Upload and Resize
A Vue.js Plugin Component for client-side image upload with resizing.

Based on [ImageUploader] (https://github.com/rossturner/HTML5-ImageUploader) by Ross Turner.

[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)


## Installation

```bash
npm install --save vue-image-upload-resize
```

## Usage


```js
import { ImageUploader } from 'vue-image-upload-resize'

export default {
  (...)

  components: {
    ImageUploader
  },

  (...)
}
```


```html
<template>
  <image-uploader
    :debug="1"
    :maxWidth="512"
    :quality="0.7"
    :autoRotate="true"
    outputFormat="verbose"
    @input="setImage"
    @onUpload="startImageResize"
    @onComplete="endImageResize"
  ></image-uploader>
</template>
```



## Settings

### Props

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

- **scaleRatio**
Allows scaling down to a specified fraction of the original size. (Example: a value of 0.5 will reduce the size by half.) Accepts a decimal value between 0 and 1.
   * type: Number,
   * default: null

- **autoRotate**
A boolean flag, if true then EXIF information from the image is parsed and the image is rotated correctly before upload. If false, then no processing is performed, and unwanted image flipping can happen.
   * type: Boolean,
   * default: true

- **outputFormat**
Sets the desired format for the returned image. Available formats are 'string' (base64), verbose (object) or 'blob' (object)
   * type: String,
   * default: 'string'

- **debug**
How much to write to the console. 0 = silent. 1 = quite. 2 = loud
   * type: Number,
   * default: 0

### Events
- **@input**
Returns the procesed image

- **@onUpload**
On start

- **@onComplete**
On end


## Development

### Launch visual tests

```bash
npm run dev
```


### Build

Bundle the js and css of to the `dist` folder:

```bash
npm run build
```


## License

[MIT](http://opensource.org/licenses/MIT)
