"use client"
import React, { useState, useEffect } from "react";
import styles from "./navbar.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [propic, setPropic] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const storedPropic = localStorage.getItem("profileImage");
        if (storedPropic) {
          setPropic(storedPropic);
        } else {
          setPropic("/gymbuddy/profile.png");
        }
      }
    });

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