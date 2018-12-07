// vue.config.js
module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
  },
}
