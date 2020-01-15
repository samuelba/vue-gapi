# Installation

## Direct Download / CDN

https://unpkg.com/vue-gapi/dist/vue-gapi 

[unpkg.com](https://unpkg.com) provides NPM-based CDN links. The above link will always point to the latest release on NPM. You can also use a specific version/tag via URLs like https://unpkg.com/vue-gapi@{{ $version }}/dist/vue-gapi.js
 
Include vue-gapi after Vue and it will install itself automatically:

```html
<script src="https://unpkg.com/vue/dist/vue.js"></script>
<script src="https://unpkg.com/vue-gapi/dist/vue-gapi.js"></script>
```

## NPM

```sh
$ npm install vue-gapi
```

## Yarn

```sh
$ yarn add vue-gapi
```

When used with a module system, you must explicitly install the `vue-gapi` via `Vue.use()`:

```javascript
import Vue from 'vue'
import vue-gapi from 'vue-gapi'

Vue.use(vue-gapi)
```

You don't need to do this when using global script tags.

## Dev Build

You will have to clone directly from GitHub and build `vue-gapi` yourself if
you want to use the latest dev build.

```sh
$ git clone https://github.com//vue-gapi.git node_modules/vue-gapi
$ cd node_modules/vue-gapi
$ npm install
$ npm run build
```

