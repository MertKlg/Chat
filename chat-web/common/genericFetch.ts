import axios, { AxiosError, type AxiosResponse } from "axios";
import type IResponse from "~/model/interfaces/iresponse";
import ResponseModel from "~/model/response-model";
import { ResultModel } from "~/model/result-model";
import authStore from "~/store/auth-store";

interface IFetch {
  url: string;
  method: Methods;
  body: any | undefined;
  credentials: Credentials;
  immediate: boolean | false
}

interface IAxiosRequest {
  url: string,
  method?: Methods,
  body?: object | object[],
  credentials?: Credentials
}

type Credentials = "same-origin" | "include" | "omit";
type Methods = "GET" | "PUT" | "POST" | "DELETE";


export const serverFetch = async <T>(axiosRequest: IAxiosRequest): Promise<ResultModel<T | null>> => {
  const API_BASE_URL = "http://localhost:8080/api/v1";

  const { data, error } = await useFetch<ResponseModel<T>>(axiosRequest.url, {
    immediate: true,
    server: true,
    method: axiosRequest.method ?? "GET",
    body: axiosRequest.body,
    credentials: "include",
    baseURL: API_BASE_URL,
    key: `serverFetch-${axiosRequest.method}-${axiosRequest.url}-${JSON.stringify(axiosRequest.body || {})}`,
  });

  if (error.value) {
    console.error(`[serverFetch] useFetch hatası (${axiosRequest.url}):`, error.value.message);
    return new ResultModel(null, {
      status: error.value.statusCode ?? 500,
      message: error.value.message ?? "Network error or unhandled fetch error"
    });
  }

  if (data.value) {
    if (data.value.status && data.value.status >= 400) {
      console.warn(`[serverFetch] API yanıtı hata durumu (${axiosRequest.url}): Status ${data.value.status}, Mesaj: ${data.value.message}`);
      return new ResultModel(null, {
        status: data.value.status,
        message: data.value.message
      });
    }

    if (data.value.value !== undefined && data.value.value !== null) {
      console.log(`[serverFetch] Başarılı yanıt (${axiosRequest.url}):`, data.value.value);
      return new ResultModel(data.value.value, {
        status: data.value.status ?? 200,
        message: data.value.message ?? "Success"
      });
    }
  }

  console.error(`[serverFetch] Beklenmedik durum: Ne veri ne de hata (${axiosRequest.url}).`);
  return new ResultModel(null, { status: 500, message: "Something went wrong or no data returned" });
};



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
    } else {
      return Promise.reject({ message: e.msg, status: 500 } as IResponse)
    }
  }
}



export type RowMapper<T> = (row: any) => T
export const request = async <T>(iAxiosRequest: IAxiosRequest, mapper?: RowMapper<T>): Promise<ResultModel<T[] | null>> => {
  try {
    const result = await axios({
      url: iAxiosRequest.url,
      data: iAxiosRequest.body,
      method: iAxiosRequest.method ?? "GET",
      withCredentials: true,
      baseURL: "http://localhost:8080/api/v1",
    })

    const response = result.data
    const value = response?.value

    if (response["value"] !== undefined || response["value"] !== null) {

      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          const mapped = mapper ? value.map(mapper) : value
          return new ResultModel(mapped)
        }

        const mapped = mapper ? [mapper(value)] : [value]
        return new ResultModel(mapped)
      }

    } else {
      return new ResultModel(null, {
        status: response.status,
        message: response.message
      })
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      return new ResultModel(null, { message: e.response?.data.message ?? "Something went wrong", status: e.response?.status ?? 500 })
    } else if (e instanceof Error) {
      return new ResultModel(null, { message: e.message ?? "Something went wrong", status: 500 })
    } else {
      return new ResultModel(null, { message: "Something went wrong", status: 500 })
    }
  }
}
