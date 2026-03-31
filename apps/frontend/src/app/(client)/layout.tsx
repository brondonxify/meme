import type { Metadata } from "next";
import { Space_Grotesk, Playfair_Display } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
    variable: "--font-playfair",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "HI-TECH - Premium Hardware",
    description: "High-performance tech gear",
};

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${spaceGrotesk.variable} ${playfairDisplay.variable} font-sans antialiased min-h-screen flex flex-col`}
            >
                <Navbar />
                <main className="flex-grow bg-[#f2f4f8]">
                    {children}
                </main>

                <Footer />
            </body>
        </html>
    );
}
