"use client";
import React from "react";
import styles from "./schedule.module.css";
import { auth, storage } from "../firebase";
import { ref, getDownloadURL, uploadString } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar/navbar";
import ExerciseList from "./exerciseList/exerciseList";
import LoadingSpinner from "../components/loadingSpinner/loadingSpinner";

const bodyParts = [
  "Chest",
  "Back",
  "Neck",
  "Waist",
  "Shoulders",
  "Cardio",
  "Lower Arms",
  "Upper Arms",
  "Lower Legs",
  "Upper Legs",
];

export default function NewSchedule() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [back, setBack] = useState(false);
  const [savedExercises, setSavedExercises] = useState([]);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [number, setNumber] = useState(10);
  const [next, setNext] = useState(false);
  const [exerciseSets, setExerciseSets] = useState({});
  const [next2, setNext2] = useState(false);
  const [exerciseInfos, setExerciseInfos] = useState({});
  const [lastStep, setLastStep] = useState(false);
  const [error, setError] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedBodyParts, setSelectedBodyParts] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
    });
  });

  const handleButtonClick = (part) => {
    setSelectedBodyParts((prevParts) =>
      prevParts.includes(part)
        ? prevParts.filter((p) => p !== part)
        : [...prevParts, part]
    );
  };

 
  const handleSetChange = (exerciseId, value) => {
    setExerciseSets((prevSets) => ({
      ...prevSets,
      [exerciseId]: value,
    }));
    setExerciseInfos((prevInfos) => ({
      ...prevInfos,
      [exerciseId]: Array.from({ length: value }, () => ({ reps: "", weight: "" })),
    }));
  };
  useEffect(() => {
    console.log(selectedBodyParts);
  }, [selectedBodyParts]);

  const nextStep = () => {
    if (selectedBodyParts.length != 0 && name !== "") {
      setNext(true);
      setBack(false);
    } else if (selectedBodyParts.length == 0) {
      setError("Please select at least one body part");
    } else if (name === "") {
      setError("Please enter a name for the schedule");
    }
  };

  const updateSelectedExercisesInfos = () => {
    const newExercises = selectedExercises.map((exercise) => {
      return {
        id: exercise.id,
        sets: exerciseInfos[exercise.id] || [],
      };
    });
    setSavedExercises(newExercises);
    console.log(newExercises);
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


  const updateSelectedExercises = (exerciseId, exerciseName) => {
    setSelectedExercises((prevSelected) => {
      if (prevSelected.some((exercise) => exercise.id === exerciseId)) {
        return prevSelected.map((exercise) =>
          exercise.id === exerciseId ? { ...exercise } : exercise
        );
      } else {
        return [...prevSelected, { id: exerciseId, name: exerciseName }];
      }
    });
  };

  const lastNextStep = () => {
    setLastStep(true);
    setNext2(true);
  };


  useEffect(() => {
    if (savedExercises.length > 0) {
      handleSaveSchedule();
    }
  }, [savedExercises]);

  const handleSaveSchedule = async () => {
    const schedule = {
      name: name,
      exercises: savedExercises,
      bodyParts: selectedBodyParts,
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

  return (
    <main className={`${styles.mainContainer} ${back ? styles.back : ""}`}>
      <div
        className={`${styles.firstContainer} ${next ? styles.nextStep : ""}`}
      >
        <form className={styles.formContainer}>
          <label className={styles.label}>
            Set a name for this new exercise schedule
          </label>
          <input
            className={styles.input}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </form>
        <div className={styles.buttonContainer}>
          {bodyParts.map((part, index) => (
            <button
              key={index}
              className={`${styles.buttonBodyPart} ${
                selectedBodyParts.includes(part) ? styles.selected : ""
              }`}
              onClick={() => handleButtonClick(part)}
            >
              {part}
            </button>
          ))}
          <div className={styles.errorContainer}>
            {error && <p className={styles.error}>{error}</p>}
          </div>
          <form className={styles.formContainer}>
            <label className={styles.label}>
              How many exercises would you like to see?
            </label>
            <input
              className={styles.input}
              type="number"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </form>
          <button onClick={nextStep} className={styles.nextButton}>
            Next
          </button>
        </div>
      </div>
      <div
        className={`${styles.secondContainer} ${next ? styles.nextStep2 : ""} ${
          back ? styles.back : ""
        } ${next2 ? styles.nextStep3 : ""}`}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className={styles.stickyButtons}>
            <div className={styles.stickyButton}>
              <p onClick={lastNextStep}>Next</p>
            </div>
            <div
              className={styles.stickyButton}
              onClick={() => {
                setNext(false), setBack(true);
              }}
            >
              Back
            </div>
          </div>
        )}
        <div className={styles.exerciseList}>
          {selectedBodyParts.map((part, index) => (
            <div key={index} className={styles.subContainer}>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className={styles.bodyPartName}>
                  Here's a list for{" "}
                  <div className={styles.buttonName}>{part}</div>
                </div>
              )}

              <div className={styles.exerciseList}>
                <ExerciseList
                  part={part}
                  go={next}
                  updateSelectedExercises={updateSelectedExercises}
                  selectedExercises={selectedExercises}
                  setLoading={setLoading}
                  loading={loading}
                  number={number}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`${styles.thirdContainer} ${lastStep ? styles.lastStep : ""}`}>
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
              {Array.from({ length: exerciseSets[exercise.id] || 0 }).map((_, setIndex) => (
                <div key={setIndex} className={styles.exerciseFormInfoSet}>
                  <hr className={styles.divider} />
                  <div className={styles.formInfo}>
                    <label className={styles.formLabel}>Reps</label>
                    <input
                      className={styles.input}
                      type="number"
                      required
                      value={exerciseInfos[exercise.id]?.[setIndex]?.reps || ""}
                      onChange={(e) =>
                        handleInputChange(exercise.id, setIndex, "reps", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.formInfo}>
                    <label className={styles.formLabel}>Weight</label>
                    <input
                      className={styles.input}
                      type="number"
                      required
                      value={exerciseInfos[exercise.id]?.[setIndex]?.weight || ""}
                      onChange={(e) =>
                        handleInputChange(exercise.id, setIndex, "weight", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
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
      <Navbar />
    </main>
  );
}
