import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Pocketwise",
  description: "Clean personal finance and robo-advisory platform.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
