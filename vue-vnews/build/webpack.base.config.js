const path = require('path')
const webpack = require('webpack')
const vueConfig = require('./vue-loader.config')
/*
    ExtractTextPlugin用于将所有的入口chunk中引用的css文件
    移动到独立分离的CSS文件，样式将不再内嵌到js bundle中，会放到一个单独的css文件中
    如果你的样式文件较大，这会做更快提前加载，css bundle会和js bundle并行加载
*/
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// webpack友好报错
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
/*
    process表示当前node的进程
    process.env包含关于系统环境的信息
    process.env中并不存在NODE_ENV，这是用户自定义的一个变量，用于判断是生产环境还是开发环境
*/
const isProd = process.env.NODE_ENV === 'production'



module.exports={
    devtool:isProd ? false : '#cheap-module-source-map',// 是否生成，如何生成source map
    output:{
        path:path.resolve(__dirname,'../dist'),
        publicPath:'/dist/',
        filename:'[name].[chunkhash].js'
    },
    resolve:{// 设置模块如何被解析
        alias: {// 别名
            'public':path.resolve(__dirname,'../public')
        }
    },
    module:{
        noParse:/es6-promise\.js$/,// 防止webpack解析那些任何与给定正则表达式相匹配的文件
        rules:[{
            test:/\.vue$/,
            loader:'vue-loader',
            options:vueConfig
        },{
            test:/\.js$/,
            loader:'babel-loader',
            exclude:/node_modules/
        },{
            test:/\.(png|jpg|gif|svg)$/,
            loader:'url-loader',
            options:{
                limit:10000,
                name:'[name].[ext]?[hash]'
            }
        },{
            test:/\.css$/,
            use:isProd ? ExtractTextPlugin.extract({
                use:'css-loader?minimize',
                fallback:'vue-style-loader'
            }) : 
            ['vue-style-loader','css-loader']
        }]
    },
    performance:{// 配置如何展示性能提示
        maxEntrypointSize:300000,// 此选项根据入口起点的最大体积，控制 webpack 何时生成性能提示
        hints:isProd ? 'warning' : false// 打开/关闭提示。当找到提示时，告诉webpack抛出一个错误或警告
    },
    plugins:isProd ? [
        new webpack.optimize.UglifyJsPlugin({// UglifyJsPlugin，js文件的压缩
            compress:{
                warnings:false
            }
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),// ModuleConcatenationPlugin,实现预编译
        new ExtractTextPlugin({
            filename:'common.[chunkhash].css'
        })
    ] : [
        new FriendlyErrorsPlugin()
    ]
}