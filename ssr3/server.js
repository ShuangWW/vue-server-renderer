const exp = require('express')
const express = exp()
const renderer = require('vue-server-renderer').createRenderer()
const createApp = require('./dist/bundle.server.js')['default']

// 设置静态文件目录
express.use('/', exp.static(__dirname + '/dist'))

const clientBundleFileUrl = '/bundle.client.js'

// getHomeInfo请求
express.get('/api/getHomeInfo',(req,res)=>{
    res.send('SSR发送请求')
})

// 响应路由请求
express.get('*', (req, res) => {
    const context = { url: req.url }

    /* 创建vue实例，传入请求路由信息
            新加一个script标签，创建一个全局对象，值是state的值，将服务器端请求得出的结果传给客户端
            head里面添加脚本，用于引入单页面应用,<script src="${clientBundleFileUrl}"></script>
    */
    createApp(context).then(app => {
        let state = JSON.stringify(context.state)

        renderer.renderToString(app, (err, html) => {
            if (err) { return res.state(500).end('运行时错误') }
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>Vue2.0 SSR渲染页面</title>
                        <script>window.__INITIAL_STATE__ = ${state}</script>
                        <script src="${clientBundleFileUrl}"></script>
                    </head>
                    <body>
                        <div id="app">${html}</div>
                    </body>
                </html>
            `)
        })
    }, err => {
        if(err.code === 404) { res.status(404).end('所请求的页面不存在') }
    })
})


// 服务器监听地址
express.listen(8080, () => {
    console.log('服务器已启动！')
})