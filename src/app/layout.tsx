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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'default';
                const root = document.documentElement;

                if (theme === 'blue') {
                  root.style.setProperty('--primary-color', '#1b4965');
                  root.style.setProperty('--secondary-color', '#62b6cb');
                  root.style.setProperty('--secondary-lowOpacity-color', 'rgba(98, 182, 203, 0.5)');
                  root.style.setProperty('--secondary-svgLoading-color', '#62b6cb');
                } else if (theme === 'green') {
                  root.style.setProperty('--primary-color', '#3a5a40');
                  root.style.setProperty('--secondary-color', '#a3b18a');
                  root.style.setProperty('--secondary-lowOpacity-color' , 'rgba(163, 177, 138, 0.5)');
                  root.style.setProperty('--secondary-svgLoading-color' , '#a3b18a');
                } else if (theme === 'violet') {
                  root.style.setProperty('--primary-color', '#8187dc');
                  root.style.setProperty('--secondary-color', '#bbadff');
                  root.style.setProperty('--secondary-lowOpacity-color' , 'rgba(87, 173, 255, 0.5)');
                  root.style.setProperty('--secondary-svgLoading-color' , '#bbadff');
                } else {
                  root.style.setProperty('--primary-color', '#370909');
                  root.style.setProperty('--secondary-color', '#b2675e');
                  root.style.setProperty('--secondary-lowOpacity-color' , 'rgba(178, 103, 94, 0.5)');
                  root.style.setProperty('--secondary-svgLoading-color' , '#b2675e');
                }
              })();
            `,
          }}
        />
        <link rel="apple-touch-icon" href="/gymbuddy/icon-192x192.png" />
        <link
          rel="apple-touch-icon-120x120"
          href="/gymbuddy/icon-192x192.png"
        />
        <link
          rel="apple-touch-icon-120x120-precomposed"
          href="/gymbuddy/icon-192x192.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/iPhone_11__iPhone_XR_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
          href="/gymbuddy/splashScreen/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/iPhone_11__iPhone_XR_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/gymbuddy/splashScreen/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="GymBuddy" />
        <link rel="manifest" href="/gymbuddy/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=NTR&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} id="root">
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
