import { fetchIdsByType } from '../api'

export default{
    fetchListData:({commit,dispatch,state},{type,index,action})=>{
        commit('SET_ACTIVE_TYPE',{type});
        return fetchIdsByType(type,index).then(
            data=>{
                switch(action){
                    case 'next': {
                        commit('ADD_TYPE_RANK_INDEX', {type, index});
                        break;
                    }
                    case 'prev': {
                        commit('DEL_TYPE_RANK_INDEX', {type});
                        break;
                    }
                    default: {
                        commit('INIT_TYPE_RANK_INDEX', {type});
                    }
                }
                commit('SET_LIST', {type, data})
            }
        )
    }
}