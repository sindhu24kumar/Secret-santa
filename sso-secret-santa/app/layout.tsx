import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holly & Hush — Secret Santa",
  description: "A little mystery. A lot of Christmas magic.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
