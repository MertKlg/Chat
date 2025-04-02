import profileStore from "~/store/profile-store";

export default defineNuxtRouteMiddleware(async (to, from) => {
  
  const profileSt = profileStore();
  if (import.meta.client) {
    await profileSt.getProfile();
    const isAuthenticated = !!profileSt.userProfile;
    const isAuthRoute = ["/sign-in", "/sign-up"].includes(to.path);

    if (!isAuthenticated && !isAuthRoute) {
      return navigateTo("/sign-in");
    }
    if (isAuthenticated && isAuthRoute) {
      return navigateTo("/");
    }
  }

});
