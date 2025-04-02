const menuStore = defineStore("menuStore", () => {
  const isMenuOpen = ref(false);

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  };

  const closeMenu = () => {
    isMenuOpen.value = false;
  };

  return { isMenuOpen, toggleMenu, closeMenu };
});

export default menuStore;
