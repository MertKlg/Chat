import type { Store, StoreDefinition } from "pinia";
import { bool, boolean } from "yup";
import type IResponse from "~/model/interfaces/iresponse";
import ResponseModel from "~/model/response-model";
import authStore from "~/store/auth-store";

interface IFetch {
  url: string;
  method: Methods;
  body: any | undefined;
  credentials: Credentials;
  immediate: boolean | false
}

type Credentials = "same-origin" | "include" | "omit";
type Methods = "GET" | "PUT" | "POST" | "DELETE";

async function genericFetch(fetch: IFetch): Promise<IResponse> {
  const auth = authStore();
  
  const { data, error } = await useFetch(fetch.url, {
    body: fetch.body ?? null,
    method: fetch.method,
    credentials: fetch.credentials,
    immediate: fetch.immediate,
  });

  if (error.value) {
    const res = error.value.data as IResponse;

    // 401 hatasında refresh yapıp tekrar deneyelim
    if (res.status === 401) {
      const refreshRes = await auth.refresh();
      if (refreshRes.status !== 200) {
        throw refreshRes;
      }
      // Sonsuz döngüyü önlemek için refresh sonrası hata alınıyorsa döngü kesilebilir.
      return genericFetch(fetch);
    }
    
    // Diğer hatalarda, hatayı fırlatıyoruz
    throw res;
  }

  // Veri geldiyse
  const res = data.value as IResponse;
  return res;
}


export async function clientSideFetch(fetch: IFetch): Promise<IResponse> {
  try {
    const res = await $fetch(fetch.url, {
      body: fetch.body,
      credentials: fetch.credentials,
      method: fetch.method,
    });

    return Promise.resolve(res as IResponse);
  } catch (e) {
    if (e.response) {
      const response = e.response;

      if (response.status == 401) {
        const auth = authStore();
        const refresh = await auth.refresh();
        if (refresh.status == 200) {
          clientSideFetch(fetch);
        } else {
          useRouter().push("/sign-in");
          return Promise.reject(refresh);
        }
      }
      
      return Promise.resolve(response._data as IResponse);
    }else{
      return Promise.reject({message : e.msg, status : 500} as IResponse)
    }
  }
}

export default genericFetch;
