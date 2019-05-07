import Vue from 'vue'
import Router from 'vue-router'
import Config from '../config/category'

Vue.use(Router)

const createListView = id => () => import('../views/CreateListView').then(m => m.default(id))
const routes = Config.map(config =>({
    path:`/${config.title}`,
    component: createListView(config.title)
}))
routes.push(
    { path: '/', redirect: routes[0].path }
);

export function createRouter(){
    return new Router({
        mode:'history',
        fallback:false,
        scrollBehavior:()=>({y:0}),
        routes:routes
    })
}