// 浏览器端所运行代码的入口，将应用直接挂载到DOM上
import Vue from 'vue'
import 'es6-promise/auto'
import { createApp } from './main'
import ProgressBar from './components/ProgressBar.vue'

const bar = Vue.prototype.$bar = new Vue(ProgressBar).$mount()
document.body.appendChild(bar.$el)

Vue.mixin({
    beforeRouteUpdate(to,from,next){
        const { asyncData } = this.$options
        if(sayncData){
            // 将获取数据操作分配给 promise
            // 以便在组件中，我们可以在数据准备就绪后
            // 通过运行 `this.dataPromise.then(...)` 来执行其他任务
            asyncData({
                store:this.$store,
                route:to
            }).then(next).catch(next)
        }else{
            next()
        }
    }
})

const { app,router,store } = createApp()
// 当时用template时，context.state将作为window.__INITIAL_STATE__状态，自动嵌入到最终的HTML中
if(window.__INITIAL_STATE__){
    store.replaceState(window.__INITIAL_STATE__)
}
router.onReady(()=>{
    // 添加路由钩子函数，用于处理 asyncData.
    // 在初始路由 resolve 后执行，
    // 以便我们不会二次预取(double-fetch)已有的数据。
    // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
    router.beforeResolve((to,from,next)=>{
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)
        // 我们只关心非预渲染的组件
        // 所以我们对比它们，找出两个匹配列表的差异组件
        let diffed = false
        const activated = matched.filter((c,i)=>{
            return diffed || (diffed = (prevMatched[i] !== c))
        })
        const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
        if (!asyncDataHooks.length) {
          return next()
        }
    
        bar.start()
        // 这里如果有加载指示器 (loading indicator)，就触发
        Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
          .then(() => {
            bar.finish()
            // 停止加载指示器(loading indicator)
            next()
          })
          .catch(next)
    })
    app.$mount('#app')
})

function isLocalhost() {
    return /^http(s)?:\/\/localhost/.test(location.href);
  }
  if (('https:' === location.protocol || isLocalhost()) && navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js')
  }