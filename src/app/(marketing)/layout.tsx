import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">

      {/* NAVBAR COMPONENT */}
      <Navbar />

      {/* CONTENT */}
      <main className="pt-24 flex-1">
        {children}
      </main>

      {/* FOOTER COMPONENT */}
      <Footer />

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/917801049830"
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl hover:scale-105 transition z-50"
      >
        WhatsApp Demo
      </a>
    </div>
  );
}