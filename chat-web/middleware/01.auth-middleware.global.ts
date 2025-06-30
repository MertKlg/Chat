import authStore from "~/store/auth-store";
import profileStore from "~/store/profile-store";

export default defineNuxtRouteMiddleware(async (to, from) => {

    if (import.meta.server) return

    const profile = profileStore()
    const auth = authStore()
    if (import.meta.client) {
        if (!profile.userProfile) {
            const result = await profile.getProfile()

            if (result.error && result.error.status === 401) {
                const refresh = await auth.refresh()

                if (refresh.error && refresh.error.status === 401) {
                    if (to.path !== "/sign-in" && to.path !== "/sign-up") {
                        return await navigateTo("/sign-in")
                    }
                    return
                }

                // We can try again getProfile request but this request might be cause infinite loop
                const profileAgain = await profile.getProfile()
                if (!profileAgain.error) {
                    if (to.path !== "/home") {
                        return await navigateTo("/home")
                    }
                    return
                }

                if (to.path !== "/sign-in") {
                    return await navigateTo("/sign-in")
                }

            }
        }

        if(to.path !== "/home"){
            return await navigateTo("/home")
        }
        return

    }
});