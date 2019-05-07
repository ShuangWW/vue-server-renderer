const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')


module.exports = merge(base,{
    target:'node',// target属性需要设置为'node'，不然打包完了也没办法在node环境下跑
    devtool:'#source-map',
    entry:'./src/entry-server.js',
    output:{
        filename:'server-bundle.js',// 每个输出bundle的名称
        libraryTarget:'commonjs2'// 配置如何暴露library
    },
    resolve: {
        alias: {
            'create-api': './create-api-server.js'
        }
    },
    externals: nodeExternals({
        // do not externalize CSS files in case we need to import it from a dep
        whitelist: /\.css$/
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"server"'
        }),
        new VueSSRServerPlugin()
    ]
})