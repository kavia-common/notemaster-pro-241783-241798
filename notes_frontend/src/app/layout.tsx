import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "NoteMaster Pro",
  description: "A retro-themed notes application with markdown support",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="crt-effect">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
