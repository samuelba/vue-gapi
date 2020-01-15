import VueGapi from './VueGapi';

const version = '__VERSION__';

function plugin (Vue, clientConfig) {
  Vue.use(VueGapi, clientConfig)
}

export default plugin
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}
export {
  version
}
