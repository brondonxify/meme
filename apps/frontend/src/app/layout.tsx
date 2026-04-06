import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import TopBanner from "@/components/layout/Banner/TopBanner";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import Footer from "@/components/layout/Footer";
import HolyLoader from "holy-loader";
import Providers from "./providers";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "HI-TECH",
  description: "Premium tech products, delivered fast",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={satoshi.className}>
        <HolyLoader color="#868686" />
        <Providers>
          <AuthProvider>
            <TopBanner />
            <TopNavbar />
            {children}
          </AuthProvider>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
