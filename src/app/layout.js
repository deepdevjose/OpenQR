import { VT323, Press_Start_2P } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

export const metadata = {
  title: "OpenQR - Free Retro QR Generator",
  description: "Generate Dynamic-looking Static QRs with a pixel-perfect design.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${vt323.variable} ${pressStart.variable} crt`}>
        {children}
      </body>
    </html>
  );
}
