import ItemList from './ItemList.vue'

const camelize = str => str.charAt(0).toUpperCase() + str.slice(1)

export default function createListView(type) {
    return {
        name: `${type}-view`,

        asyncData({
            store
        }) {
            return store.dispatch('fetchListData', {
                type
            })
        },

        title: camelize(type),

        render(h) {
            return h(ItemList, {
                props: {
                    type
                }
            })
        }
    }
}