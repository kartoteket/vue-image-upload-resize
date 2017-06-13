import ImageUploader from './ImageUploader.vue'

function plugin (Vue) {
  Vue.component('image-uploader', ImageUploader)
}

// Install by default if using the script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin
const version = '__VERSION__'

// Export all components too
export {
  ImageUploader,
  version
}
