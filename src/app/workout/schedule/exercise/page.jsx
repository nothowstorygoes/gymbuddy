"use client";
import React, { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { auth, storage } from "../../../firebase";
import Image from "next/image";
import Navbar from "../../../components/navbar/navbar";
import styles from "./exercise.module.css"
import { useRouter } from "next/navigation";
import { getDownloadURL, ref } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import LoadingSpinner from '../../../components/loadingSpinner/loadingSpinner';

const ExerciseInfoChild = () => {
  const params = useSearchParams();
  const name = params.get("name");
  const schedule = params.get("schedule");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exerciseInfo, setExerciseInfo] = useState([]);
  const router= useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const scheduleRef = ref(storage, `${user.uid}/schedule.json`);
        getDownloadURL(scheduleRef)
          .then((url) => {
            fetch(url)
              .then((response) => response.json())
              .then((data) => {
                const matchingSchedule = data.find(
                  (s) => s.name === schedule
                );
                if (matchingSchedule) {
                  const matchingExercise = matchingSchedule.exercises.find(
                    (e) => e.name === name
                  );
                  if (matchingExercise) {
                    setExerciseInfo(matchingExercise);
                  }
                }
                setLoading(false);
              })
              .catch((error) => {
                console.error("Error fetching schedule data:", error);
                setLoading(false);
              });
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
            setLoading(false);
          });
      } else setUser(null);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [name, schedule]);

  return (
    <main className={styles.mainContainer}>
         <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={() => router.back()}>
          Back
        </button>
      </div>
      {loading ? (
        <LoadingSpinner/>
      ) : exerciseInfo ? (
        <div className={styles.exerciseContainer}>
          <h1 className={styles.name}>{exerciseInfo.name}</h1>
          <Image src={exerciseInfo.gif} alt={exerciseInfo.name} className={styles.gif} width={300} height={300} priority={true}/>
          {exerciseInfo.instructions.map((instruction, index) => (
            <p key={index} className={styles.instruction}>{instruction}</p>
          ))}        
          </div>
      ) : (
        <p>Exercise not found</p>
      )}
    <Navbar/>   
    </main>
  );
};

export default function ExerciseInfo() {
  return (
    <Suspense fallback={<LoadingSpinner/>}>
        <ExerciseInfoChild />
    </Suspense>

  );
}
