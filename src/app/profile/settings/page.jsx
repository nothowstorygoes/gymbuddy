"use client";
import React from "react";
import styles from "./settings.module.css";
import { auth, storage } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, uploadString, ref } from "firebase/storage";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/navbar";

export default function Settings() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [chosenMeasure, setChosenMeasure] = useState("");
  const [currentTheme, setCurrentTheme] = useState("default");


  useEffect(() => {
    setCurrentTheme(localStorage.getItem('theme') || 'default');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        getDownloadURL(ref(storage, `${user.uid}/info.json`)).then((url) => {
          fetch(url)
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              setInfo(data);
              setChosenMeasure(data.chosenMeasure);
              setLoading(false);
            });
        });
      } else setUser(null);
    });

    return unsubscribe;
  }, []);

  const logOut = () => {
    auth
      .signOut()
      .then(() => {
        setUser(null);
        router.push("/"); // Redirect to login page
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  const handleMeasureChange = (measure) => {
    setChosenMeasure(measure);
    const updatedInfo = { ...info, chosenMeasure: measure };
    setInfo(updatedInfo);

    const infoRef = ref(storage, `${user.uid}/info.json`);
    uploadString(infoRef, JSON.stringify(updatedInfo))
      .then(() => {
        console.log("Info updated successfully");
      })
      .catch((error) => {
        console.error("Error updating info: ", error);
      });
  };

  function setTheme(theme) {
    const root = document.documentElement;

    if (theme === "blue") {
        setCurrentTheme("blue");
      root.style.setProperty("--primary-color", "#1b4965");
      root.style.setProperty("--secondary-color", "#62b6cb");
      // Set other variables for the blue theme
    } else if (theme === "green") {
        setCurrentTheme("green");
      root.style.setProperty("--primary-color", "#3a5a40");
      root.style.setProperty("--secondary-color", "#a3b18a");
      // Set other variables for the dark theme
    } else if (theme === "violet") {
        setCurrentTheme("violet");
      root.style.setProperty("--primary-color", "#564592");
      root.style.setProperty("--secondary-color", "#ea698b");
      // Set other variables for the dark theme
    } else {
        setCurrentTheme("default");
      // Default theme
      root.style.setProperty("--primary-color", "#370909");
      root.style.setProperty("--secondary-color", "#b2675e");
      // Set other variables for the default theme
    }

    localStorage.setItem("theme", theme);
  }

  const goOffline = () => {
    router.push("/~offline");
  }

  return (
    <main className={styles.mainContainer}>
      {loading ? <LoadingSpinner /> : (
        <div>
      
      <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={() => router.back()}>
          Back
        </button>
        <button className={styles.offlineButton} onClick={goOffline}>
          Go Offline
        </button>
      </div>

      <div className={styles.settingsContainer}>
        <h1>Settings</h1>
        <div className={styles.settingsItem}>
          <div className={styles.settingsItemContent}>
            <h2>Chosen measure</h2>
            <div className={styles.buttonsContainer}>
              <button
                className={`${styles.buttonSetting} ${
                  chosenMeasure === "metric" ? styles.active : ""
                }`}
                onClick={() => handleMeasureChange("metric")}
              >
                Metric
              </button>
              <button
                className={`${styles.buttonSetting} ${
                  chosenMeasure === "imperial" ? styles.active : ""
                }`}
                onClick={() => handleMeasureChange("imperial")}
              >
                Imperial
              </button>
            </div>
          </div>
        </div>
        <div className={styles.settingsItem}>
          <h2>Set Theme</h2>
          <div className={styles.themeSettingsContainer}>
            <button
              onClick={() => setTheme("default")}
              className={`${styles.theme} ${
                currentTheme === "default" ? styles.active : ""
              }`}
            >
              Classic Red
            </button>
            <button
              onClick={() => setTheme("blue")}
              className={`${styles.theme} ${
                currentTheme === "blue" ? styles.active : ""
              }`}
            >
              Deep Blue
            </button>
            <button
              onClick={() => setTheme("green")}
              className={`${styles.theme} ${
                currentTheme === "green" ? styles.active : ""
              }`}
            >
              Forest Green
            </button>
            <button
              onClick={() => setTheme("violet")}
              className={`${styles.theme} ${
                currentTheme === "violet" ? styles.active : ""
              }`}
            >
              Space Violet
            </button>
          </div>
          </div>
          <div className={styles.settingsItem}>
            <div className={styles.logOutContainer}>
              <button onClick={logOut} className={styles.logout}>Log Out</button>
            </div>
        </div>
      </div>
    </div>
      )}
      <Navbar/>
    </main>
  );
}
