"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "./components/WalletContextProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <div>
            {children}
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}