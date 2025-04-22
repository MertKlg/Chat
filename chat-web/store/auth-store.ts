import { API_URL } from "~/common/API";
import { clientSideFetch } from "~/common/genericFetch";
import type IResponse from "~/model/interfaces/iresponse";

const authStore = defineStore("authStore", () => {

    async function refresh(): Promise<IResponse> {
        const { data, error } = await useFetch(`${API_URL}/auth/refresh`, {
            credentials: "include",
            method: "POST",
        });

        console.log("Refresh log : " + data.value)
        console.log("Refresh error log : " + error.value)


        if (error.value != null) {
            const res = error.value.data as IResponse;
            return Promise.reject(res);
        }

        const res = data.value as IResponse;
        return Promise.resolve(res);
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
