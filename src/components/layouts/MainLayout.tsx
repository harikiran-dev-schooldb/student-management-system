// src/components/layouts/MainLayout.tsx

import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900">
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold">
            School DB
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-600 text-center">
          © {new Date().getFullYear()} School DB. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default MainLayout;