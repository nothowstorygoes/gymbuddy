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
import { on } from "events";

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
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [number, setNumber] = useState(10);
  const [next, setNext] = useState(false);
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
    })
  });

  const handleButtonClick = (part) => {
    setSelectedBodyParts((prevParts) =>
      prevParts.includes(part)
        ? prevParts.filter((p) => p !== part)
        : [...prevParts, part]
    );
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

  const updateSelectedExercises = (exerciseId, reps, sets, weight) => {
    setSelectedExercises((prevSelected) => {
      if (prevSelected.some((exercise) => exercise.id === exerciseId)) {
        return prevSelected.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, reps, sets, weight }
            : exercise
        );
      } else {
        return [...prevSelected, { id: exerciseId, reps, sets, weight }];
      }
    });
  };

  const handleSaveSchedule = async () => {
    const schedule = {
      name: name,
      exercises: selectedExercises,
      bodyParts: selectedBodyParts,
    };
    console.log(schedule);
  
    const scheduleRef = ref(storage, `${user.uid}/schedule.json`);
  
    try {
      // Fetch the existing schedules
      const url = await getDownloadURL(scheduleRef);
      const response = await fetch(url);
      const existingSchedules = await response.json();
  
      // Append the new schedule to the existing schedules
      const updatedSchedules = [...existingSchedules, schedule];
  
      // Upload the updated schedules back to the JSON file
      await uploadString(scheduleRef, JSON.stringify(updatedSchedules));
  
      // Navigate to the workout page
      router.push("/workout");
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        // If the file does not exist, create a new one with the new schedule
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
        className={`${styles.secondContainer} ${next ? styles.nextStep2 : ""} ${back ? styles.back : ""}`}
      >
        {loading ?  <LoadingSpinner /> : <div className={styles.stickyButtons}>
        <div className={styles.stickyButton}><p onClick={handleSaveSchedule}>Save</p></div>
        <div className={styles.stickyButton} onClick={() => {setNext(false),setBack(true)}}>
          Back  
        </div>
        </div>}
        <div className={styles.exerciseList}>
        {selectedBodyParts.map((part, index) => (
          <div key={index} className={styles.subContainer}>
           {loading ?  <LoadingSpinner /> :<div className={styles.bodyPartName}>
              Here's a list for <div className={styles.buttonName}>{part}</div>
            </div> }
            
            <div className={styles.exerciseList}><ExerciseList part={part} go={next} updateSelectedExercises={updateSelectedExercises} selectedExercises={selectedExercises} setLoading={setLoading} loading={loading} number={number}/></div>
          </div>
        ))}
        </div>  
        
      </div>
      <div className={styles.thirdContainer}>
        
      </div>
      <Navbar />
    </main>
  );
}
