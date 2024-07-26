"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import { useEffect } from "react";
import { useState } from "react";
import ScreenAlert from "./components/ScreenAlert";

const inter = Inter({ subsets: ["latin"] });

function useWindowSizeCheck() {
  const [isWithinRange, setIsWithinRange] = useState(true);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsWithinRange(width >= 320 && width <= 719);
    }

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return !isWithinRange;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showDiv = useWindowSizeCheck();

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/gymbuddy/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=NTR&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {showDiv ? (
          <div className={styles.container}>
            <ScreenAlert />
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
