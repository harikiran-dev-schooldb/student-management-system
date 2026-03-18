import { Suspense } from "react";
import { NavbarServer } from "./Navbar";

export default function PageNavbar({
  schoolId,
  onToggleSidebar,
}: {
  schoolId: string;
  onToggleSidebar?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 pt-[calc(env(safe-area-inset-top)+6px)]">
      <Suspense fallback={null}>
        <NavbarServer
          schoolId={schoolId}
          onToggleSidebar={onToggleSidebar}
        />
      </Suspense>
    </header>
  );
}

