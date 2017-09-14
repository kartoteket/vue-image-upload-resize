import ImageUploader from 'src/ImageUploader.vue'
import { createVM } from '../helpers/utils.js'

describe('ImageUploader', () => {
  it('Should have a create method', function () {
    ImageUploader.created.should.be.a('function')
  })

  it('Should have file type input in dom', function () {
    const vm = createVM(this, `<image-uploader></image-uploader>`, { components: { ImageUploader }})
    vm.$el.querySelector('#fileInput').should.have.attr('type', 'file')
  })
})
