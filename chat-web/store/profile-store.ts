import { API_URL } from "~/common/API"
import type IResponse from "~/model/interfaces/iresponse"
import authStore from "./auth-store"
import genericFetch from "~/common/genericFetch"


interface IUser {
    users_id : number,
    username : string,
    email : string,
    phone : string,
}

const profileStore = defineStore("profileStore", () => {

    const userProfile = ref<IUser | undefined>(undefined)

    const getProfile = async () => {
        try{
            if(userProfile.value){
                return
            }
    
            const res = await genericFetch(
                {
                  url:  `${API_URL}/profile/get`,
                  method : 'GET',
                  body : undefined,
                  credentials : "include",
                  immediate : true
                }
            )
    
            if(res.status === 200){
                if(res.value.length > 0){
                    userProfile.value = res.value[0]
                }
            }
        }catch(e){}
    }

    return { userProfile, getProfile }

})

export default profileStore