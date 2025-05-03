import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { ThemeProvider } from "@/providers/ThemeContext";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HavenChat",
  description: "A real-time chat web application built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ThemeProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased bg-offwhite dark:bg-nocturnalplum",
            fontSans.variable
          )}
        >
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
