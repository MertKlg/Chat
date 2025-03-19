import type IResponse from "~/model/interfaces/iresponse";

export type TToastStatus = "success" | "warning" | "error";

type ToastPayload = {
  title: string;
  description: string | undefined;
};

interface IToast {
  id: number;
  title: string;
  description: string | undefined;
  status: string;
}

const deafultTimeout = 5000;

const createToast = (payload: ToastPayload, status: TToastStatus): IToast => ({
  id: Math.random() * 1000,
  title: payload.title,
  description: payload.description,
  status: status,
});

const toastStore = defineStore("toastStore", () => {
  const toasts: Ref<IToast[]> = ref([]);

  const add = (payload: ToastPayload, status: TToastStatus) => {
    const toast = createToast(payload, status);
    toasts.value = [...toasts.value, toast]

    setTimeout(() => {
      remove(toast.id);
    }, deafultTimeout);
  };

  const success = (payload: ToastPayload) => {
    add(payload, "success");
  };

  const error = (payload: ToastPayload) => {
    add(payload, "error");
  };

  const warning = (payload: ToastPayload) => {
    add(payload, "warning");
  };

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((e) => e.id != id);
  };

  const sendToastWithResponse = (res : IResponse) => {
    if(res.status === 200){
      add({title : res.message , description : ''}, "success")
    }else{
      add({title : res.message , description : ''}, "error")
    }
  }

  return { toasts, success, error, warning, remove,sendToastWithResponse };
});

export default toastStore;
