import { API_URL, STORAGE } from "~/common/API"
import type IResponse from "~/model/interfaces/iresponse"
import authStore from "./auth-store"
import genericFetch from "~/common/genericFetch"
import type IUser from "~/model/interfaces/iuser"

const profileStore = defineStore("profileStore", () => {

    const userProfile = ref<IUser | undefined>(undefined)

    const getProfile = async () => {
        try{
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

                console.log(userProfile.value)
            }
        }catch(e){
            console.error("Profile store error : ", e)
        }
    }

    return { userProfile, getProfile }

})

export default profileStore