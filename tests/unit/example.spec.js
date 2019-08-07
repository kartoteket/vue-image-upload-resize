import { shallowMount } from '@vue/test-utils'
//import App from '@/App.vue'
import ImageUploader from '@/components/ImageUploader.vue'

const createCmp = propsData => shallowMount(ImageUploader, { propsData })

describe('ImageUploader', () => {
  let cmp

  // test props
  describe('Properties', () => {
    it('has props.id', () => {
      cmp = createCmp({ id: 'customID' })
      expect(cmp.props().id).toBe('customID')
    })
    it('maxWidth prop is 1024', () => {
      expect(cmp.props().maxWidth).toBe(1024)
    })
    it('maxHeight prop is 1024', () => {
      expect(cmp.props().maxHeight).toBe(1024)
    })
  })

  // Inspect the raw component options
  it('has a created hook', () => {
    expect(typeof ImageUploader.created).toBe('function')
  })

  // default data
  it('sets the correct default data', () => {
    expect(typeof ImageUploader.data).toBe('function')
    const defaultData = ImageUploader.data()
    expect(defaultData.imagePreview).toBe(null)
  })

  describe('Events', () => {
    // todo
  })
})
