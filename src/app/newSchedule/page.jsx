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
    setSelectedBodyParts((prevParts) =>
      prevParts.some((p) => p.part === partObj.part)
        ? prevParts.filter((p) => p.part !== partObj.part)
        : [...prevParts, partObj]
    );
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
        number: number.toString()
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
      <Navbar />
    </main>
  );
}
