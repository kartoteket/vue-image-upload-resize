/*!
 * vue-image-upload-resize
 * Based on ImageUploader (c) Ross Turner (https://github.com/rossturner/HTML5-ImageUploader)
 * Adapted by (c) 2018 Svale Fossåskaret (http://kartoteket.as/team/svale.html / @Fossesvale)
 * @license MIT.
 */
// Import vue component
import component from './ImageUploader.vue'

// Declare install function executed by Vue.use()
export function install(Vue) {
  if (install.installed) return
  install.installed = true
  Vue.component('ImageUploader', component)
}

// Create module definition for Vue.use()
const plugin = {
  install,
}

// Auto-install when vue is found (eg. in browser via <script> tag)
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
component.install = install

// To allow use as module (npm/webpack/etc.) export component
export default component
