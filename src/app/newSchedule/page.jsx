"use client";
import React from "react";
import styles from "./schedule.module.css";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar/navbar";

const bodyParts = [
  {
    display: "Chest"
  },
  { display: "Back" },
  { display: "Upper Legs" },
  { display: "Lower Legs"},
  { display: "Upper Arms" },
  { display: "Lower Arms" },
  { display: "Neck"},
  { display: "Cardio"},
  { display: "Shoulders"},
  { display: "Waist"}
];

export default function NewSchedule() {
  const [name, setName] = useState("");
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [number, setNumber] = useState(10);
  const [error, setError] = useState("");
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

  const handleButtonClick = (partObj) => {
    setSelectedBodyParts((prevParts) => {
      const isPresent = prevParts.some((p) => p.display.toLowerCase() === partObj.display.toLowerCase());
      if (isPresent) {
        return prevParts.filter((p) => p.display.toLowerCase() !== partObj.display.toLowerCase());
      } else {
        return [...prevParts, { ...partObj, display: partObj.display.toLowerCase() }];
      }
    });
  };

  useEffect(() => {
    console.log(selectedBodyParts);
  }, [selectedBodyParts]);

  const handleNext = ({}) => {
    if(name === "") {
      setError("Please enter a name for this schedule");
      return;
    }
    else if(selectedBodyParts.length === 0) {
      setError("Please select at least one body part");
      return;
    }
    else{
      const params = new URLSearchParams({
        name: name.toString(),
        bodyParts: JSON.stringify(selectedBodyParts),
      });
      router.push(`/newSchedule/ScheduleExercise?${params.toString()}`);
    }
  };

  return (
    <main
      className={styles.mainContainer}
    >
      <div
        className={styles.firstContainer}
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
            selectedBodyParts.some((p) => p.display.toLowerCase() === bodyPart.display.toLowerCase()) ? styles.selected : ""
          }`}
          onClick={() => handleButtonClick(bodyPart)}
        >
          {bodyPart.display}
        </button>
          ))}
          <div className={styles.errorContainer}>
            {error && <p className={styles.error}>{error}</p>}
          </div>
          <button onClick={handleNext} className={styles.nextButton}>
            Next
          </button>
        </div>
      </div>
      <Navbar />
    </main>
  );
}
