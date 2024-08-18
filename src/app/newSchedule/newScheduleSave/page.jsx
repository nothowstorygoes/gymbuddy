"use client";
import React from "react";
import styles from "../schedule.module.css";
import { auth, storage } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/navbar";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ref, getDownloadURL, uploadString } from "firebase/storage";

function NewScheduleSaveChild() {
  const searchParams = useSearchParams();
  const [savedExercises, setSavedExercises] = useState([]);
  const selectedExercises = JSON.parse(searchParams.get("selectedExercises"));
  const selectedBodyParts = JSON.parse(searchParams.get("bodyParts"));
  const name = searchParams.get("name");
  const number = searchParams.get("number");
  const [exerciseSets, setExerciseSets] = useState({});
  const [exerciseInfos, setExerciseInfos] = useState({});
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        router.push("/login");
      }
    });
  },[user]);

  const handleBack = () => {
    const params = new URLSearchParams({
        name: name.toString(),
        bodyParts: JSON.stringify(selectedBodyParts),
        number: number.toString(),
      });
        router.push(`/newSchedule/ScheduleExercise?${params.toString()}`);
  };

  const handleSaveSchedule = async () => {
    const schedule = {
      name: name,
      exercises: savedExercises,
    };
    console.log(schedule);
    const scheduleRef = ref(storage, `${user.uid}/schedule.json`);
    try {
      const url = await getDownloadURL(scheduleRef);
      const response = await fetch(url);
      const existingSchedules = await response.json();
      const updatedSchedules = [...existingSchedules, schedule];
      await uploadString(scheduleRef, JSON.stringify(updatedSchedules));
      router.push("/workout");
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        await uploadString(scheduleRef, JSON.stringify([schedule]));
        router.push("/workout");
      } else {
        console.error("Error saving schedule:", error);
      }
    }
  };

  const handleInputChange = (exerciseId, setIndex, field, value) => {
    setExerciseInfos((prevInfos) => {
      const updatedInfos = { ...prevInfos };
      if (!updatedInfos[exerciseId]) {
        updatedInfos[exerciseId] = [];
      }
      if (!updatedInfos[exerciseId][setIndex]) {
        updatedInfos[exerciseId][setIndex] = { reps: "", weight: "" };
      }
      updatedInfos[exerciseId][setIndex][field] = value;
      return updatedInfos;
    });
  };

  const updateSelectedExercisesInfos = () => {
    const newExercises = selectedExercises.map((exercise) => {
      return {
        id: exercise.id,
        name: exercise.name,
        instructions: exercise.instructions,
        gif: exercise.gif,
        sets: exerciseInfos[exercise.id] || [],
      };
    });
    setSavedExercises(newExercises);
    console.log(newExercises);
  };

  const handleSetChange = (exerciseId, value) => {
    setExerciseSets((prevSets) => ({
      ...prevSets,
      [exerciseId]: value,
    }));
    setExerciseInfos((prevInfos) => ({
      ...prevInfos,
      [exerciseId]: Array.from({ length: value }, () => ({
        reps: "",
        weight: "",
      })),
    }));
  };

  const allFormsFilled = () => {
    for (const exerciseId in exerciseInfos) {
      const sets = exerciseInfos[exerciseId];
      for (const set of sets) {
        if (!set.reps || !set.weight) {
          return false;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    if (savedExercises.length > 0) {
      handleSaveSchedule();
    }
  }, [savedExercises]);

  return (
    <main className={styles.mainContainer}>
      <div id="thirdContainer" className={styles.thirdContainer}>
      <div className={styles.stickyDiv}>
          <div className={styles.stickyButton} onClick={handleBack}>
            Back
          </div>
        </div>
        <div className={styles.titleSave}>Add sets and reps for your exercises in <b>{name}</b></div>
        {selectedExercises.map((exercise) => (
          <div key={exercise.id} className={styles.exerciseInfoSelected}>
            <div className={styles.exerciseName}>{exercise.name}</div>
            <form className={styles.formContainer}>
              <div className={styles.formInfo}>
                <label className={styles.formLabel}>Sets</label>
                <input
                  className={styles.input}
                  type="number"
                  required
                  value={exerciseSets[exercise.id] || ""}
                  onChange={(e) => handleSetChange(exercise.id, e.target.value)}
                />
              </div>
              {Array.from({ length: exerciseSets[exercise.id] || 0 }).map(
                (_, setIndex) => (
                  <div key={setIndex} className={styles.exerciseFormInfoSet}>
                    <hr className={styles.divider} />
                    <div className={styles.formInfo}>
                      <label className={styles.formLabel}>Reps</label>
                      <input
                        className={styles.input}
                        type="number"
                        required
                        value={
                          exerciseInfos[exercise.id]?.[setIndex]?.reps || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            exercise.id,
                            setIndex,
                            "reps",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className={styles.formInfo}>
                      <label className={styles.formLabel}>Weight</label>
                      <input
                        className={styles.input}
                        type="number"
                        required
                        value={
                          exerciseInfos[exercise.id]?.[setIndex]?.weight || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            exercise.id,
                            setIndex,
                            "weight",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </form>
            <hr className={styles.divider} />
          </div>
        ))}
        <button
          onClick={updateSelectedExercisesInfos}
          className={styles.buttonLastStep}
          disabled={!allFormsFilled()}
        >
          Done
        </button>
      </div>
    </main>
  );
}

export default function NewScheduleSave(){
    return (
        <Suspense>
        <NewScheduleSaveChild />
        </Suspense>
    );
}