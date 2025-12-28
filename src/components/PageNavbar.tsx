import { Suspense } from "react";
import { NavbarServer } from "./Navbar";

export default function PageNavbar() {
  return (
    <header className="sticky top-0 z-30">
      <Suspense fallback={null}>
        <NavbarServer />
      </Suspense>
    </header>
  );
}
