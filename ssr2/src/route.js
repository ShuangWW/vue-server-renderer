import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default function createRouter() {
    let router = new VueRouter({
        // 要记得增加mode属性，因为#后面的内容不会发送至服务器，服务器不知道请求的是哪一个路由
        mode: 'history',
        routes: [
            {
                alias: '/',
                path: '/home',
                component: require('./views/home.vue')
            },
            {
                path: '/animal',
                component: require('./views/animal.vue')
            },
            {
                path: '/people',
                component: require('./views/people.vue')
            }
        ]
    })

    return router
}