import { API_URL } from "~/common/API";
import genericFetch from "~/common/genericFetch";
import type IResponse from "~/model/interfaces/iresponse";

const authStore = defineStore("authStore", () => {
    const isAuthanticated = ref(false);

    async function refresh(): Promise<IResponse> {


        const { data, error } = await useFetch(`${API_URL}/auth/refresh`, {
            credentials: "include",
            method: "POST",
        });

        try {
            if (error.value != null) {
                const res = error.value.data as IResponse;
                return Promise.reject(res);
            }
            const res = data.value as IResponse;
            return Promise.resolve(res);
        } catch (e) {
            if (e instanceof Error) {
                return Promise.reject({ message: e.message, status: 500 } as IResponse);
            }

            return Promise.reject({
                message: "Something went wrong",
                status: 500,
            } as IResponse);
        }
    }

    const logOut = async () => { };

    return { refresh, logOut };
});

export default authStore;
