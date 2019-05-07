import Vue from 'vue'
import App from './App.vue'
import { createStore } from './store'
import { createRouter } from './router'
import { sync } from 'vuex-router-sync'
import titleMixin from './util/title'
import * as filters from './util/filters'

Vue.mixin(titleMixin)

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

export function createApp () {
  const store = createStore()
  const router = createRouter()
  // 同步路由状态(route state)到store
  sync(store, router)
  const app = new Vue({
    router,
    store,
    render: h => h(App)
  })
  // 暴露app，router,store
  return { app, router, store }
}
