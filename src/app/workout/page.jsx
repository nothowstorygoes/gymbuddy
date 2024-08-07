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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [router]);

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
              <img src="/gymbuddy/listAll.png" className={styles.listButton} />
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
ì        <div className={styles.previousWorkoutContainer}>
    <div className={styles.previousWorkoutTitle}>Previous workouts</div>
    {workoutData.length > 0
        ? workoutData.slice(-7).reverse().map((item, index) => (
            <div key={index} className={styles.previousWorkout}>
                {item.date} - {item.schedule.name}
                <img
                    src="/gymbuddy/listAll.png"
                    className={styles.listButton2}
                />
            </div>
        ))
        : ""}
</div>
      <Navbar />
    </main>
  );
}
