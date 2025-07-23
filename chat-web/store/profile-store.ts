import { API_URL, STORAGE } from "~/common/API"
import type IResponse from "~/model/interfaces/iresponse"
import { clientSideFetch, request } from "~/common/genericFetch"
import type IUser from "~/model/interfaces/iuser"
import ResponseModel from "~/model/response-model"
import type { ResultModel } from "~/model/result-model"

const profileStore = defineStore("profileStore", () => {

    const userProfile = ref<IUser | undefined>(undefined)

    const getProfile = async (): Promise<ResultModel<IUser[] | null>> => {
        const res = await request<IUser>(
            {
                url: `/profile/get`,
                method: "GET",
                credentials: "include"
            }
        )
        if(res.data){
            userProfile.value = res.data[0]
        }
        return res
    }


    const deleteProfile = async () => {
        return await request({
            url: `/auth/delete`,
            method: "DELETE",
            credentials: "include"
        }) 
    }

    return { userProfile, getProfile, deleteProfile }

})

export default profileStore
