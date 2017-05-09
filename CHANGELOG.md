# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.0.5"></a>
## [0.0.5](https://github.com/acburdine/denali-node-orm2/compare/v0.0.4...v0.0.5) (2017-05-09)


### Bug Fixes

* **associations:** update & fix *Related methods on adapter ([8231861](https://github.com/acburdine/denali-node-orm2/commit/8231861))
* **orm:** return true from setAttribute ([6b278aa](https://github.com/acburdine/denali-node-orm2/commit/6b278aa))



<a name="0.0.4"></a>
# [0.0.4](https://github.com/acburdine/denali-node-orm2/compare/v0.0.1...v0.0.4) (2017-03-22)

### Bug Fixes

* **format:** add .editorconfig file ([2f3269c](https://github.com/acburdine/denali-node-orm2/commit/2f3269c))
* **initializers:** sync database after orm model definition ([b0c3933](https://github.com/acburdine/denali-node-orm2/commit/b0c3933))
* add updated .babelrc files so babel will build correctly (#10) ([098865e](https://github.com/acburdine/denali-node-orm2/commit/098865e))
* update to use non-static methods ([79e3314](https://github.com/acburdine/denali-node-orm2/commit/79e3314))

### Features

* update to work with latest Denali (#8) ([392fadf](https://github.com/acburdine/denali-node-orm2/commit/392fadf))


<a name="0.0.1"></a>
## 0.0.1 (2016-11-14)


### Bug Fixes

* registering as the application adapter is not needed, Denali falls back to config.ormAdapter automatically ([d5fa788](https://github.com/denali-js/denali-node-orm2/commit/d5fa788))
* return the set value from setAttribute to better mimic native JS setter behavior ([c80ead8](https://github.com/denali-js/denali-node-orm2/commit/c80ead8))
* update to leverage denali's new defineModels convention ([c56c55a](https://github.com/denali-js/denali-node-orm2/commit/c56c55a))
