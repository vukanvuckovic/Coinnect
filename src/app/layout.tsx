import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coinnect",
  description: "Manage your finances effortlessly.",
  icons: ["/icons/logo.png"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} scrollbar-none overscroll-none antialiased`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster
          richColors
          theme="light"
          toastOptions={{
            classNames: {
              title: "!text-black",
              description: "!text-gray-600",
            },
          }}
        />
      </body>
    </html>
  );
}
