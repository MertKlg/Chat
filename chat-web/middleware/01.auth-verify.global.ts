import profileStore from "~/store/profile-store";


export default defineNuxtRouteMiddleware(async (to, from) => {
    const profileSt = profileStore()

    if (import.meta.client) {
        await profileSt.getProfile()
        const isAuthenticated = profileSt.userProfile;
        const isAuthRoute = to.path === "/sign-in" || to.path === "/sign-up";

        if (!isAuthenticated && !isAuthRoute) {
          return navigateTo("/sign-in");
        }
    
        if (isAuthenticated && isAuthRoute) {
          return navigateTo("/");
        }
      }

});
