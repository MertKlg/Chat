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
    toasts.value.push(toast);

    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== toast.id);
    }, deafultTimeout);
  };

  const success = (payload: ToastPayload) => {
    add(payload, "success");

    console.log(toasts);
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

  return { toasts, success, error, warning, remove };
});

export default toastStore;
