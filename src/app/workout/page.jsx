"use client";
import React, { useEffect, useState } from "react";
import styles from "./workout.module.css";
import Navbar from "../components/navbar/navbar";
import { auth, storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../components/loadingSpinner/loadingSpinner";

export default function Workout() {
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const router = useRouter();
  const [svgColor, setSvgColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState("");

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "default";
    setCurrentTheme(theme);
  }, []);

  useEffect(() => {
    if (currentTheme === "blue") {
      setSvgColor("#1b4965");
      // Set other variables for the blue theme
    } else if (currentTheme === "green") {
      setSvgColor("#3a5a40");
      // Set other variables for the dark theme
    } else if (currentTheme === "violet") {
      setSvgColor("#8187dc");
      // Set other variables for the dark theme
    } else {
      // Default theme
      setSvgColor("#370909");
      // Set other variables for the default theme
    }
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const workoutRef = ref(storage, `${user.uid}/workout.json`);
        getDownloadURL(workoutRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setWorkoutData(data);
          })
          .catch((error) =>
            console.error("Error fetching workout.json:", error)
          );

        const schedulesRef = ref(storage, `${user.uid}/schedule.json`);
        getDownloadURL(schedulesRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setSavedSchedules(data);
          })
          .catch((error) =>
            console.error("Error fetching schedules.json:", error)
          );
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
  }, [router, currentTheme]);

  const pushWithParams = ({ item }) => {
    const params = new URLSearchParams({ name: item.name.toString() });
    router.push(`/workout/schedule?${params.toString()}`);
  };

  const handleListAll = () => {
    router.push("/workout/scheduleListAll");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.newSchedule}>
        <a href="/gymbuddy/newSchedule" className={styles.newScheduleButton}>
          Add new schedule +
        </a>
      </div>
      <div className={styles.savedSchedulesContainer}>
        <p className={styles.savedSchedulesTitle}>
          Your saved exercise schedules
        </p>
        <div className={styles.savedSchedules}>
          <div className={styles.schedulesContainer}>
            {savedSchedules.length > 0
              ? savedSchedules.slice(0, 4).map((item, index) => (
                  <div
                    key={index}
                    className={styles.schedule}
                    onClick={() => pushWithParams({ item })}
                  >
                    {item.name}
                  </div>
                ))
              : ""}
          </div>
          {savedSchedules.length > 0 ? (
            <div className={styles.listAllButton} onClick={handleListAll}>
              <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d={`M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z`}
                  fill={svgColor}
                />
              </svg>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className={styles.logWorkout}>
        <a href="/gymbuddy/logWorkout" className={styles.logWorkoutButton}>
          Log a workout +
        </a>
      </div>
      <div className={styles.previousWorkoutContainer}>
        <div className={styles.previousWorkoutTitle}>Previous workouts</div>
        {workoutData.length > 0
          ? workoutData
              .slice(-7)
              .reverse()
              .map((item, index) => (
                <div key={index} className={styles.previousWorkout}>
                  {item.date} - {item.schedule.name}
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d={`M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z`}
                      fill={svgColor}
                    />
                  </svg>
                </div>
              ))
          : ""}
      </div>
      <Navbar />
    </main>
  );
}
