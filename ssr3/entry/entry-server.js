import { createApp } from '../src/main'

export default context => {
    return new Promise((resolve, reject) => {
        const app = createApp()

        // 更改路由
        app.$router.push(context.url)

        // 获取相应路由下的组件
        const matchedComponents = app.$router.getMatchedComponents()

        // 如果没有组件，说明该路由不存在，报错404
        if (!matchedComponents.length) { return reject({ code: 404 }) }

        // 遍历路由下所有组件，如果有需要服务端渲染的请求则进行请求
        Promise.all(matchedComponents.map(component=>{
            if(component.serverRequest){                        // serverRequest用于判断是否需要服务端请求数据，若需要则执行此函数，并传入一个store参数
                return component.serverRequest(app.$store)
            }
        })).then(()=>{
            // 将路由匹配下的组件的serverRequest函数执行后返回的结果赋值给context对象
            context.state = app.$store.state
            resolve(app)
        }).catch(reject)
    })

}