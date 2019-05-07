const fs = require('fs')
const path = require('path')
// 用于在内存中管理缓存数据，可以让程序不依赖任何外部数据库实现缓存管理
const LRU = require('lru-cache')
const express = require('express')
// favicon用于请求网页的logo
const favicon = require('serve-favicon')
// compression压缩请求
const compression = require('compression')
// express route缓存
const microcache = require('route-cache')
// 路径（绝对路径/相对路径）
const resolve = file => path.resolve(__dirname, file)
const { createBundleRenderer } = require('vue-server-renderer')
const axios = require('axios')
const websiteConfig = require('./src/config/website');

const isProd = process.env.NODE_ENV === 'production'
const useMicroCache = process.env.MICRO_CACHE !== 'false'
const serverInfo =
    `express/${require('express/package.json').version} ` +
    `vue-server-renderer/${require('vue-server-renderer/package.json').version}`


const app = express()

function createRenderer(bundle,options){
    return createBundleRenderer(bundle,Object.assign(options,{
        cache:LRU({
            max:1000,
            maxAge:1000 * 60 * 15
        }),
        basedir:resolve('./dist'),
        runInNewContext:false
    }))
}

let renderer
let readyPromise
// 服务器渲染的HTML模板
const templatePath = resolve('./src/index.template.html')
if(isProd){
    const template = fs.readFileSync(templatePath,'utf-8')
    // 生产环境下，webpack结合vue-ssr-webpack-plugin插件生成的server bundle
    const bundle = require('./dist/vue-ssr-server-bundle.json')
    // clientMainfest是可选项，允许渲染器自动插入preload/prefetch特性至后续渲染的html中
    const clientManifest = require('./dist/vue-ssr-client-manifest.json')
    renderer = createRenderer(bundle,{
        template,
        clientManifest
    })
}else{
    readyPromise = require('./build/setup-dev-server')(
        app,
        templatePath,
        (bundle,options)=>{
            console.log('bundle callback..')
            renderer = createRenderer(bundle,options)
        }
    )
}

// 设置静态文件目录
const serve = (path, cache) => express.static(resolve(path), {
    maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
})

app.use(compression({threshold: 0}))
app.use(favicon('./public/logo-48.png'))
app.use('/dist', serve('./dist', true))
app.use('/public', serve('./public', true))
app.use('/manifest.json', serve('./manifest.json', true))
app.use('/service-worker.js', serve('./dist/service-worker.js'))
app.use(microcache.cacheSeconds(1, req => useMicroCache && req.originalUrl))

function render(req, res) {
    const s = Date.now()

    res.setHeader("Content-Type", "text/html")
    res.setHeader("Server", serverInfo)

    const handleError = err => {
        if (err.url) {
            res.redirect(err.url)
        } else if (err.code === 404) {
            res.status(404).send('404 | Page Not Found')
        } else {
            // Render Error Page or Redirect
            res.status(500).send('500 | Internal Server Error')
            console.error(`error during render : ${req.url}`)
            console.error(err.stack)
        }
    }

    const context = {
        title: '掘金', // default title
        url: req.url
    }
    renderer.renderToString(context, (err, html) => {
        if (err) {
            return handleError(err)
        }
        res.send(html)
        if (!isProd) {
            console.log(`whole request: ${Date.now() - s}ms`)
        }
    })
}

// 解决跨域，转发代理
app.get('/v1/get_entry_by_rank', (req, res) => {
    console.log(req.url);
    axios({
        method:'get',
        url: websiteConfig.host + req.url,
        responseType:'stream'
    }).then(response => {
        // console.log(response);
        response.data.pipe(res);
    }).catch(err => {
        console.error(err);
        res.status(500).send('500 | Internal Server Error')
    });
});

app.get('*',isProd ? render : (req,res)=>{
    readyPromise.then(()=>render(req,res))
})

const port = process.env.PORT || 8081
app.listen(port,()=>{
    console.log(`server started at localhost:${port}`)
})