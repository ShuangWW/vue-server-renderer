import {createAPI} from 'create-api';
import Category from '../config/category';
import axios from 'axios'

const logRequests = true || !!process.env.DEBUG_API;
const api = createAPI()
const categoryMap = {};
Category.forEach(category => {
    categoryMap[category.title] = category
})

if(api.onServer){
    warmCache()
}

function warmCache(){
    setTimeout(warmCache, 1000 * 60 * 15)
}

function getCategoryId(type) {
    return categoryMap[type].id;
}

function getFetchUrl(type, before) {
    before = before ? '&before=' + before : '';
    if (categoryMap[type]) {
        return api.url + '&category=' + getCategoryId(type) + before;
    }
    return type;
}
function fetch(child) {
    logRequests && console.log(`fetching ${child}...`)
    const cache = api.cachedItems;
    if (cache && cache.has(child)) {
        logRequests && console.log(`cache hit for ${child}.`)
        return Promise.resolve(cache.get(child))
    } else {
        return new Promise((resolve, reject) => {
            axios.get(child).then(res => {
                const val = res.data && res.data.d;
                if (val) val.__lastUpdated = Date.now()
                cache && cache.set(child, val);
                logRequests && console.log(`fetched ${child}.`);
                resolve(val);
            }, reject).catch(reject);
        })
    }
}

export function fetchIdsByType(type, before) {
    console.log('[fetchIdsByType]: ', type);
    const child = getFetchUrl(type, before);
    return fetch(child);
}