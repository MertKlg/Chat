import { API_URL, STORAGE } from "~/common/API"
import type IResponse from "~/model/interfaces/iresponse"
import genericFetch, { clientSideFetch } from "~/common/genericFetch"
import type IUser from "~/model/interfaces/iuser"
import ResponseModel from "~/model/response-model"

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
                userProfile.value = res.value[0]
            }
        }catch(e){
            console.error(e)
        }
    }

    const deleteProfile = async () : Promise<ResponseModel>  => {
        try{            
            const res = await clientSideFetch(
                {
                  url:  `${API_URL}/profile/delete`,
                  method : 'DELETE',
                  body : undefined,
                  credentials : "include",
                  immediate : false
                }
            ) as ResponseModel

            return res
        }catch(e){
            if(e instanceof ResponseModel){
                return e
            }else if(e instanceof Error){
                return new ResponseModel(e.message ?? "Something went wrong", 500)
            }
            return new ResponseModel("Something went wrong", 500)
        }
    }

    return { userProfile, getProfile, deleteProfile }

})

export default profileStore
