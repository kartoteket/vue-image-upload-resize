# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres (more or less) to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

___
## [2.3]  - 2020-01-27
### Fixed
- Update entry points so that the plugin can be used as SFC with local registration ref [issue #32](https://github.com/kartoteket/vue-image-upload-resize/issues/32).
### Changed
- Slimmed down npm tarball to essentiel files only.


## [2.2]  - 2019-12-11
### Changed
- Changed verbose output object to allways return an exif property (which is `null` if no exifdata)
- Updated all non-major dependencies

## [2.1.2]  - 2019-11-29
### Added
- Aded a section on use with nuxt.js (thanks @atymic )
### Changed
- Update eslint-utils  to 1.4.3

___
## [2.1.1]  - 2019-08-19
### Changed
- Changed default value of capture property to 'false' to access both camera and gallery on mobile devices, ref  [issue #17](https://github.com/kartoteket/vue-image-upload-resize/issues/17

___
## [2.1.0]  - 2019-08-18
### Added
- New inline exif-reader utility based on exif.js, ref [issue #15](https://github.com/kartoteket/vue-image-upload-resize/issues/15) 
- New output format "info" that includes details on image dimensions, ref [issue 19](https://github.com/kartoteket/vue-image-upload-resize/issues/19)

### Changed
- Updated dependecies.
- Updated Readme.
- Re-organized 'verbose' output to include dataUrl, the new info output and and exif data.

### Removed
- exif-js-js dependecy, ref [issue #15](https://github.com/kartoteket/vue-image-upload-resize/issues/15)

## [2.0.4] - 2019-01-23
### Fixed
-  A bump release to update npm dist files with 2.0.3 changes

## [2.0.3] - 2018-12-20
### Fixed
- Fixes missing binding on accept attribute (thanks @XeO3 )

## [2.0.2] - 2018-12-13
###  Added
- [codebox.io demo](https://codesandbox.io/s/mqnow97omj?module=%2Fsrc%2Fcomponents%2FHelloWorld.vue)
### Changed
- Updated Readme to reflect new Plugin arcitecture
- Update dependencies vue and vue-template-compiler

## [2.0.1] - 2018-12-12
### Fixed
- Fixed incorrect paths in package.json

## [2.0.0] - 2018-12-12

### Added
- This CHANGELOG file
- New prop/attribute 'accept' to open for use with other filetypes than just 'image/*' (thank you [@Pitouli](https://github.com/Pitouli))
- New prop 'doNotResize' to ignore mutation of selected file types (thank you [@Pitouli](https://github.com/Pitouli))
- Added 'file' as outputformat
- Attached exif-data to verbose output. Ref issue #5 (thank you [@adamcolejenkins](https://github.com/adamcolejenkins))

### Changed
- Total re-factor to the Vue CLI-3 framework


# Non-tracked earlier versions
## [1.1.5] - 2018-01-31
## [1.1.4] - 2017-11-20
## [1.1.3] - 2017-11-10
## [1.1.2] - 2017-11-01
## [1.1.1] - 2017-11-01
## [1.1.0] - 2017-11-01
## [1.0.2] - 2017-10-17
## [1.0.1] - 2017-09-28
## [1.0.0] - 2017-09-14
## [0.5.0] - 2017-08-07