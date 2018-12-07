import ImageUploader from './ImageUploader.vue'

const ImageUploaderPlugin = {
  install(Vue) {
    Vue.component('image-uploader', ImageUploader)
  },
}

// Install by default if using the script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(ImageUploaderPlugin)
}

export default ImageUploaderPlugin
export { ImageUploader }

/*
import ImageUploader from './ImageUploader.vue'

// register component
function plugin(Vue) {
  Vue.component('image-uploader', ImageUploader)
}

// Install by default if using the script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin
// Export component too
export { ImageUploader }

=============
*/
