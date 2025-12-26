export const isMobileApp = () => {
  if (typeof window === "undefined") return false;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone;

  const isMobile = window.innerWidth < 768;

  return isStandalone || isMobile;
};
