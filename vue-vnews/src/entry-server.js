// 服务器端代码运行的入口，根据路由状态，返回渲染完成后相应的组件
import {
    createApp
} from './main'
import {
    resolve
} from '../node_modules/uri-js';
const isDev = process.env.NODE_ENV !== 'production'

export default context => {
    // 因为有可能是异步路由钩子函数或组件，所以返回一个Promise,以便服务器能够等待所有的内容在渲染前就已经准备就绪
    return new Promise((resolve, reject) => {
        const s = isDev && Date.now()
        const { app,router,store } = createApp()

        const { url } = context
        const { fullPath } = router.resolve(url).route

        if (fullPath !== url) {
            return reject({
                url: fullPath
            })
        }

        // 设置服务器端 router 的位置
        router.push(url)

        // 等到 router 将可能的异步组件和钩子函数解析完
        router.onReady(() => {
            const matchedComponents = router.getMatchedComponents()
            // 匹配不到的路由，执行 reject 函数，并返回 404
            if (!matchedComponents.length) {
                return reject({
                    code: 404
                })
            }
            // 对所有匹配的路由组件调用 `asyncData()`
            Promise.all(matchedComponents.map(({
                asyncData
            }) => asyncData && asyncData({
                store,
                route: router.currentRoute
            }))).then(() => {
                isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)
                // 在所有预取钩子(preFetch hook) resolve 后，
                // 我们的 store 现在已经填充入渲染应用程序所需的状态。
                // 当我们将状态附加到上下文，
                // 并且 `template` 选项用于 renderer 时，
                // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
                context.state = store.state
                resolve(app)
            }).catch(reject)
        }, reject)
    })
}