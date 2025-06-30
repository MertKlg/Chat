import { API_URL } from "~/common/API";
import { clientSideFetch, request } from "~/common/genericFetch";
import type IResponse from "~/model/interfaces/iresponse";
import type ResponseModel from "~/model/response-model";
import type { ResultModel } from "~/model/result-model";

const authStore = defineStore("authStore", () => {


    async function refresh(): Promise<ResultModel<string[] | null>> {
        const req = await request<string>({
            url: `/auth/refresh`,
            method: "POST",
        })

        return req
    }



    const signOut = async () => await clientSideFetch({ body : "", credentials : "include", method : "POST", url : `${API_URL}/auth/sign-out`, immediate : false })

    const signIn = async (values : any) => await clientSideFetch({
        body : values,
        credentials : "include",
        method : "POST",
        immediate : false,
        url : `${API_URL}/auth/sign-in`,
    })


    return { refresh, signOut, signIn };
});

export default authStore;
