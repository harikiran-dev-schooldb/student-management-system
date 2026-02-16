import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}

      <a
        href="https://wa.me/917801049830"
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-600 transition z-50"
      >
        WhatsApp Demo
      </a>

      <Footer />
    </>
  );
}
