"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { auth, storage } from "../../../firebase";
import Image from "next/image";
import Navbar from "../../../components/navbar/navbar";
import styles from "./exercise.module.css";
import { useRouter } from "next/navigation";
import { getDownloadURL, ref } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import LoadingSpinner from '../../../components/loadingSpinner/loadingSpinner';

const ExerciseInfoChild = () => {
  const params = useSearchParams();
  const name = params.get("name");
  const part = params.get("part");
  const [gif, setGif] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exerciseInfo, setExerciseInfo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const scheduleRef = ref(storage, `exercises/${part}.json`);
        getDownloadURL(scheduleRef)
          .then((url) => {
            fetch(url)
              .then((response) => response.json())
              .then((data) => {
                const exercise = data.find((e) => e.name === name);
                if (exercise) {
                  setExerciseInfo(exercise);
                  const trimmedGifUrl = exercise.gifUrl.trimStart();
                  const gifRef = ref(storage, `exercises/gifs/${trimmedGifUrl}`);
                  getDownloadURL(gifRef)
                    .then((url) => {
                      setGif(url);
                      setLoading(false);
                    })
                    .catch((error) => {
                      console.error("Error getting download URL:", error);
                      setLoading(false);
                    });
                } else {
                  setLoading(false);
                }
              })
              .catch((error) => {
                console.error("Error fetching exercise data:", error);
                setLoading(false);
              });
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
            setLoading(false);
          });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [name, part]);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={() => router.back()}>
          Back
        </button>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : exerciseInfo ? (
        <div className={styles.exerciseContainer}>
          <h1 className={styles.name}>{exerciseInfo.name}</h1>
          <Image src={gif} alt={exerciseInfo.name} className={styles.gif} width={300} height={300} priority={true} />
          {exerciseInfo.instructions.map((instruction, index) => (
            <p key={index} className={styles.instruction}>{instruction}</p>
          ))}
        </div>
      ) : (
        <p>Exercise not found</p>
      )}
      <Navbar />
    </main>
  );
};

export default function ExerciseInfo() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ExerciseInfoChild />
    </Suspense>
  );
}