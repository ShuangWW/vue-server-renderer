// vue-loader是一个webpack的loader，它允许你以一种名为单文件组件的格式撰写Vue组件
module.exports = {
    extractCSS: process.env.NODE_ENV === 'production',
    preserveWhitesapce:false,
    postcss:[
        require('autoprefixer')({
            browsers:['last 3 versions']
        })
    ]
}