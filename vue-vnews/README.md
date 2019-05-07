安装依赖包：cnpm i
运行：cnpm run dev
打包：cnpm run build
# 使用Vue2结合ssr

功能类似[vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0), 只不过内容源换成[掘金网站](https://juejin.im/)，因而无法使用service worker的push功能。

## 替换思路
1. 手动获取掘金网站的目录，接口路径是`https://gold-tag-ms.juejin.im/v1/categories`需要在掘金官网的控制台中查看，保存到本地文件[src/config/category.js](https://github.com/tiodot/vnews/blob/master/src/config/category.js)中
2. 观察掘金的获取数据列表接口为`https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&limit=20&category=5562b415e4b00c57d9b94ac8`,这部分配置在[src/config/website.js](https://github.com/tiodot/vnews/blob/master/src/config/website.js)中，如果域名更换了，修改该配置即可
3. 为了解决跨域问题，在[server.js](https://github.com/tiodot/vnews/blob/master/server.js#L118)中增加转发代理：
  ```
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
  ```

1.index.template.html页面模板
2.通用代码
    运行在服务器和客户端的代码
    main.js
        是通用的entry,导出一个createApp函数
    客户端
        每个用户会在他们各自的浏览器中使用新的应用程序实例
        生命周期：所有周期均可以被调用
        entry-client.js
            只需要创建应用程序，并将其挂载到DOM中
    服务端
        希望每个请求都是全新的独立的应用程序实例，以便不会有交叉请求造成的状态污染
        生命周期：只有beforeCreate和created才会被调用
        entry-server.js
            使用export default导出函数，并在每次渲染中重复调用此函数