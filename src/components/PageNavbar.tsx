import { Suspense } from "react";
import { NavbarServer } from "./Navbar";

export default function PageNavbar({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30">
      <Suspense fallback={null}>
        <NavbarServer onToggleSidebar={onToggleSidebar} />
      </Suspense>
    </header>
  );
}
