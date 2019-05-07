const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
/* 
    用于使用service worker来缓存外部项目依赖项
    它将使用sw-precache生成service worker文件并将其添加到您的构建目录。
    为了在service worker中生成预缓存的名单, 这个插件必须应用在assets已经被webpack打包之后
    这个方案只能在HTTPS协议中应用，http不能生效。
*/
const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const Category = require('../src/config/category');

const config = merge(base, {
    entry: {
        app: './src/entry-client.js'
    },
    resolve: {
        alias: {
            'create-api': './create-api-client.js'
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"client"'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
                return (
                    /node_modules/.test(module.context) &&
                    !/\.css$/.test(module.request)
                )
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        }),
        new VueSSRClientPlugin()
    ]
})

if (process.env.NODE_ENV === 'production') {
    const categories = Category.map(category => category.title).join('|');
    const categoryUrlPattern = new RegExp('^/(' + categories + ')');
    config.plugins.push(
        // auto generate service worker
        new SWPrecachePlugin({
            cacheId: 'vue-hn',
            filename: 'service-worker.js',
            minify: false,
            dontCacheBustUrlsMatching: /./,
            staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/],
            runtimeCaching: [{
                    urlPattern: '/',
                    handler: 'networkFirst'
                },
                {
                    urlPattern: categoryUrlPattern,
                    handler: 'networkFirst'
                }
            ]
        })
    )
}

module.exports = config