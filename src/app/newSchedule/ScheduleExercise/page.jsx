'use client';
import React, { useState, useEffect } from "react";
import styles from "../schedule.module.css";
import ExerciseList from "../exerciseList/exerciseList";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function ScheduleExerciseChild() {
  const [loading, setLoading] = useState(true); // Lifted loading state
  const [selectedExercises, setSelectedExercises] = useState([]);
  const searchParams = useSearchParams();
  const number = searchParams.get("number");
  const selectedBodyParts = JSON.parse(searchParams.get("bodyParts"));
  const name = searchParams.get("name");
  const router = useRouter();

  const updateSelectedExercises = (exerciseId, exerciseName, exercisePart) => {
    setSelectedExercises((prevSelected) => {
      if (prevSelected.some((exercise) => exercise.id === exerciseId)) {
        console.log(selectedExercises);

        return prevSelected.filter((exercise) => exercise.id !== exerciseId);
      } else {
        console.log(selectedExercises);

        return [...prevSelected, { id: exerciseId, name: exerciseName , part: exercisePart}];
      }
    });
  };

  const handleNext = () => {
    if(selectedExercises.length != 0) {
    const params = new URLSearchParams({
        name: name.toString(),
        bodyParts: JSON.stringify(selectedBodyParts),
        selectedExercises: JSON.stringify(selectedExercises),
      });
      router.push(`/newSchedule/newScheduleSave?${params.toString()}`);
  }};

    const handleBack = () => {
         router.push("/newSchedule");
    };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <main className={styles.mainContainer}>
    <div id="secondContainer" className={styles.secondContainer}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.stickyButtons}>
          <div className={styles.stickyButton} onClick={handleNext}>
            Next
          </div>
          <div className={styles.stickyButton} onClick={handleBack}>
            Back
          </div>
        </div>
      )}
      <div className={`${styles.exerciseListContainer}`}>
        {selectedBodyParts.map((part, index) => (
          <div key={index} className={styles.subContainer}>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className={styles.bodyPartName}>
                Here&apos;s a list for{" "}
                <div className={styles.buttonName}>{part.display}</div>
              </div>
            )}

            <div id="exerciseList" className={styles.exerciseList}>
              <ExerciseList
                part={part.display}
                updateSelectedExercises={updateSelectedExercises}
                selectedExercises={selectedExercises}
                setLoading={setLoading} // Pass setLoading to ExerciseList
                loading={loading}
                number={number}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
    </main>
  );
}

export default function ScheduleExercise() {
  return (
    <Suspense>
      <ScheduleExerciseChild />
    </Suspense>
  );
}