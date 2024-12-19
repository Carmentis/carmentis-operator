import type { Metadata } from "next";

import "bootstrap-icons/font/bootstrap-icons.min.css"
import "./globals.css";



export const metadata: Metadata = {
  title: "Carmentis | Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
