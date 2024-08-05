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
  {
    display: "Chest",
    part: 11,
  },
  { display: "Back", part: 12 },
  { display: "Legs", part: 9 },
  { display: "Shoulders", part: 13 },
  { display: "Arms", part: 8 },
  { display: "Abs", part: 10 },
  { display: "Calves", part: 14 },
  { display: "Cardio", part: 15 },
];

export default function NewSchedule() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedExercises, setSavedExercises] = useState([]);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [number, setNumber] = useState(10);
  const [exerciseSets, setExerciseSets] = useState({});
  const [exerciseInfos, setExerciseInfos] = useState({});
  const [error, setError] = useState("");
  const [currentContainer, setCurrentContainer] = useState("firstContainer");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedBodyParts, setSelectedBodyParts] = useState([]);
  const [firstVisibility,setFirstVisibility] = useState(true);
  const [secondVisibility,setSecondVisibility] = useState(false);
  const [thirdVisibility, setThirdVisibility] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
    });
  });

  const handleButtonClick = (partObj) => {
    setSelectedBodyParts((prevParts) =>
      prevParts.some((p) => p.part === partObj.part)
        ? prevParts.filter((p) => p.part !== partObj.part)
        : [...prevParts, partObj]
    );
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
  useEffect(() => {
    console.log(selectedBodyParts);
  }, [selectedBodyParts]);

  const updateSelectedExercisesInfos = () => {
    const newExercises = selectedExercises.map((exercise) => {
      return {
        id: exercise.id,
        name: exercise.name,
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
        console.log(selectedExercises);

        return prevSelected.filter((exercise) => exercise.id !== exerciseId);

      } else {
        console.log(selectedExercises);

        return [...prevSelected, { id: exerciseId, name: exerciseName }];

      }
    });
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

  const handleNext = () => {
    if (currentContainer === "firstContainer") {
      setSecondVisibility(true); // Set next to true when transitioning to the second container
      setCurrentContainer("secondContainer");
      setFirstVisibility(false);
    } else if (currentContainer === "secondContainer" && selectedExercises.length != 0) {
        setSecondVisibility(false);
        setThirdVisibility(true);
        setCurrentContainer("thirdContainer");
    }
    else if(currentContainer === "secondContainer" && selectedExercises.length == 0)
    {
      console.log(currentContainer);
      setError("Please select at least one exercise");
    }
  };

  const handleBack = () => {
    if (currentContainer === "thirdContainer") {
      setSecondVisibility(true);
    setThirdVisibility(false);  
      setCurrentContainer("secondContainer");
    } else if (currentContainer === "secondContainer") {
      setCurrentContainer("firstContainer");
      setFirstVisibility(true);
      setSecondVisibility(false);
    }
  };

  return (
    <main
      id="mainContainer"
      className={styles.mainContainer}
    >
      <div
        id="firstContainer"
        className={`${styles.firstContainer} ${!firstVisibility ? styles.firstVisibility : ""}`}
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
          {bodyParts.map((bodyPart, index) => (
            <button
              key={index}
              className={`${styles.buttonBodyPart} ${
                selectedBodyParts.includes(bodyPart) ? styles.selected : ""
              }`}
              onClick={() => handleButtonClick(bodyPart)}
            >
              {bodyPart.display}
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
          <button onClick={handleNext} className={styles.nextButton}>
            Next
          </button>
        </div>
      </div>
      <div id="secondContainer" className={`${styles.secondContainer} ${secondVisibility ? styles.secondVisibility : ""}`}>
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
        <div
          className={`${styles.exerciseListContainer}`}
        >
          {selectedBodyParts.map((part, index) => (
            <div
              key={index}
              className={`${styles.subContainer} ${secondVisibility ? styles.secondVisibility : ""}`}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className={styles.bodyPartName}>
                  Here's a list for{" "}
                  <div className={styles.buttonName}>{part.display}</div>
                </div>
              )}

              <div id="exerciseList" className={styles.exerciseList}>
                <ExerciseList
                  part={part.part}
                  go={secondVisibility}
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
      <div
        id="thirdContainer"
        className={`${styles.thirdContainer} ${
          thirdVisibility ? styles.thirdVisibility : ""
        }`}
      >
        <div className={styles.stickyButtons}>
          <div className={styles.stickyButton} onClick={handleBack}>
            Back          </div>
        </div>
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
      <Navbar />
    </main>
  );
}
