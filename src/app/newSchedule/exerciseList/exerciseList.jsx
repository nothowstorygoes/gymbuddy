import React, { useState, useEffect } from "react";
import styles from "./exerciseList.module.css";

const ExerciseList = ({
  part,
  go,
  updateSelectedExercises,
  selectedExercises,
  setLoading,
  loading,
  number,
}) => {
  const [exercises, setExercises] = useState([]);
  const [visibleDetails, setVisibleDetails] = useState({});
  const [bodyPart, setBodyPart] = useState("");
  const [id, setId] = useState("");
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [weight, setWeight] = useState(0);

  useEffect(() => {
    setBodyPart(part.toLowerCase());
    if (go) {
      const fetchExercises = async (bodyPart) => {
        const response = await fetch(
          `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}?limit=${number}&offset=0`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-key": process.env.NEXT_PUBLIC_APIEXERCISES,
              "x-rapidapi-host": process.env.NEXT_PUBLIC_APIEXERCISESHOST,
            },
          }
        );
        const data = await response.json();
        setExercises(data);
        setLoading(false);
      };

      fetchExercises(bodyPart);
    }
  }, [bodyPart, go]);

  const toggleDetails = (index) => {
    setVisibleDetails((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleExName = (exercisesId) =>
  {
    setId(exercisesId);
  
  }

  const handleButtonClick = (reps, sets, weight) => {
    updateSelectedExercises(id, reps, sets, weight);
  };

  const isSelected = (exerciseId) => {
    return id === exerciseId;
  };

  return (
    <div className={styles.listContainer}>
      {Array.isArray(exercises) &&
        exercises.map((exercise, index) => (
          <div
            key={index}
            className={`${styles.exercise} ${
              isSelected(exercise.id) ? styles.selected : ""
            }`}
          >
            <div className={styles.nameAndButton}>
              <p className={styles.exerciseName}>{exercise.name}</p>
              <img
                className={`${styles.detailsButton} ${
                  visibleDetails[index] ? styles.rotated : ""
                }`}
                onClick={() => toggleDetails(index)}
                src="/gymbuddy/toggle.png"
              />
              <p
                className={`${styles.button} ${
                  isSelected(exercise.id) ? styles.rotated : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleExName(exercise.id);
                }}
              >
                +
              </p>
            </div>
            {isSelected(exercise.id) ? <div className={styles.exerciseInfoSelected}>
                <form className={styles.formContainer}>
                  <div className={styles.formInfo}>
                  <label className={styles.label}>Sets</label>
                  <input
                    className={styles.input}
                    type="number"
                    required
                    value={exercise.sets}
                    onChange={(e) => {
                      setSets(e.target.value);
                    }}
                  />
                  </div>
                  <div className={styles.formInfo}>
                  <label className={styles.label}>Reps</label>
                  <input
                    className={styles.input}
                    type="number"
                    required
                    value={exercise.reps}
                    onChange={(e) => {
                      setReps(e.target.value);
                    }}

                  />
                  </div>
                  <div className={styles.formInfo}>
                  <label className={styles.label}>Weight</label>
                  <input
                    className={styles.input}
                    type="number"
                    required
                    value={exercise.weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                    }}  
                  />
                  </div>
                  <button
                    onClick={() =>
                      handleButtonClick(reps, sets, weight)
                    }
                    className={styles.button}>Done</button>
                  </form>
              </div> : ""} 
            <div
              className={`${styles.exerciseDescription} ${
                visibleDetails[index] ? styles.expanded : ""
              }`}
            >
              <img
                src={exercise.gifUrl}
                alt={`${exercise.name} gif`}
                className={styles.exerciseGif}
              />
              <div className={styles.exerciseInstructions}>
                {exercise.instructions.map((instruction, index) => (
                  <p key={index}>{instruction}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ExerciseList;
