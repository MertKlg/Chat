import { API_URL } from "~/common/API";
import type IResponse from "~/model/interfaces/iresponse";

const authStore = defineStore("authStore", () => {
    async function refresh(): Promise<IResponse> {

        const { data, error } = await useFetch(`${API_URL}/auth/refresh`, {
            credentials: "include",
            method: "POST",
        });


        if (error.value != null) {
            const res = error.value.data as IResponse;
            return Promise.reject(res);
        }

        const res = data.value as IResponse;
        return Promise.resolve(res);
    }

    const logOut = async () => { };

    return { refresh, logOut };
});

export default authStore;
