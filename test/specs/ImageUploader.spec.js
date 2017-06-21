import ImageUploader from 'src/ImageUploader.vue'
import { createVM } from '../helpers/utils.js'

describe('ImageUploader.vue', function () {
  it('should render correct contents', function () {
    const vm = createVM(this, `
<image-uploader></image-uploader>
`, { components: { ImageUploader }})
    vm.$el.querySelector('.upload-caption').textContent.should.eql('Legg til et bilde…')
  })
})
