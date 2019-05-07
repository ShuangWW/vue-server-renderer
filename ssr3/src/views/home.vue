<template>
    <div>
        home
        <div>{{homeInfo}}</div>
    </div>
</template>
<script>
export default {
    // 此函数用于告诉服务器端，让服务器来请求数据，然后通过监听store中的数据来获取参数
    serverRequest(store){
        return store.dispatch('getHomeInfo')
    },
    computed:{
        homeInfo(){
            return this.$store.state.homeInfo
        }
    }
}
</script>


<style scoped>
</style>