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


    const deleteProfile = async (): Promise<ResponseModel> => {
        try {
            const res = await clientSideFetch(
                {
                    url: `${API_URL}/profile/delete`,
                    method: 'DELETE',
                    body: undefined,
                    credentials: "include",
                    immediate: false
                }
            ) as ResponseModel

            return res
        } catch (e) {
            if (e instanceof ResponseModel) {
                return e
            } else if (e instanceof Error) {
                return new ResponseModel(e.message ?? "Something went wrong", 500)
            }
            return new ResponseModel("Something went wrong", 500)
        }
    }

    return { userProfile, getProfile, deleteProfile }

})

export default profileStore
