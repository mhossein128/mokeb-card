import "./globals.css";
import "react-advanced-cropper/dist/style.css";
import localFont from "next/font/local";

const primaryFont = localFont({
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
  src: [
    {
      path: "../assets/font/abar font/AbarLow-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/font/abar font/AbarLow-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/font/abar font/AbarLow-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/font/abar font/AbarLow-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../assets/font/abar font/AbarLow-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
});

export const metadata = {
  title: "Moukeb 1120",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={primaryFont.className}>
      <body className={primaryFont.className}>{children}</body>
    </html>
  );
}
