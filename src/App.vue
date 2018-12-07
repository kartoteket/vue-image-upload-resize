<template>
  <div id="app">
    <image-uploader
      :preview="true"
      :className="['fileinput', { 'fileinput--loaded': hasImage }]"
      capture="environment"
      :debug="2"
      :autoRotate="true"
      outputFormat="verbose"
      @input="setImage"
    ></image-uploader>
  </div>
</template>

<script>
import ImageUploader from './components/ImageUploader.vue'

export default {
  name: 'app',
  components: {
    ImageUploader,
  },
  data() {
    return { hasImage: false }
  },
  methods: {
    setImage: function(output) {
      this.hasImage = true
      this.image = output
      console.log(output)
    },
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
