"use client"
import React from "react";
import styles from "./navbar.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth, storage } from "../../firebase";
import { useState, useEffect } from "react";
import { getDownloadURL, ref } from "firebase/storage";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [propic, setPropic] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const infoRef = ref(storage, `${user.uid}/info.json`);
        getDownloadURL(infoRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            console.log(data.propic);
            if (data.propic === true) {
              const picRef = ref(storage, `${user.uid}/proPic.png`);
              getDownloadURL(picRef).then((url) => {
                fetch(url)
                  .then((res) => res.blob())
                  .then((blob) => {
                    const img = URL.createObjectURL(blob);
                    console.log(img);
                    localStorage.setItem("propic", img); // Cache the image URL
                    setPropic(img);
                  });
              });
            } else {
              setPropic("/gymbuddy/profile.png");
            }
          });
      }
    });

    // Check if the image is already cached
    const cachedPropic = localStorage.getItem("propic");
    if (cachedPropic) {
      setPropic(cachedPropic);
    }

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <a href="/gymbuddy/dashBoard" className={styles.navbarButton}>
          <img src="/gymbuddy/dashboard.png" className={styles.navbarImg} loading="lazy" />
          <p>dashboard</p>
        </a>
        <a href="/gymbuddy/workout" className={styles.navbarButton}>
          <img src="/gymbuddy/logWorkout.png" className={styles.navbarImg} loading="lazy" />
          <p>work out</p>
        </a>
        <a href="/gymbuddy/logFood" className={styles.navbarButton}>
          <img src="/gymbuddy/logProtein.png" className={styles.navbarImg} loading="lazy" />
          <p>diary</p>
        </a>
        <a href="/gymbuddy/profile" className={styles.navbarButton}>
          <img src={propic} className={styles.navbarPropic} loading="lazy" />
          <p>profile</p>
        </a>
      </div>
    </div>
  );
}