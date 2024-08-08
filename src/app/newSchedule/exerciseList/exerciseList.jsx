import React, { useState, useEffect } from "react";
import styles from "./exerciseList.module.css";

const ExerciseList = ({
  part,
  updateSelectedExercises,
  selectedExercises,
  setLoading,
  number,
}) => {
  const [exercises, setExercises] = useState([]);
  const [visibleDetails, setVisibleDetails] = useState({});
  const [id, setId] = useState("");

  const fetchExercises = async (part) => {
    console.log("Fetching exercises...");
    const response = await fetch(
      `https://wger.de/api/v2/exercisebaseinfo/?category=${part}&limit=${number}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${process.env.NEXT_PUBLIC_APIEXERCISES}`,
        },
      }
    );
    const data = await response.json();
    if (Array.isArray(data.results)) {
      const filteredExercises = data.results.flatMap((result) =>
        result.exercises.filter(
          (exercise) =>
            exercise.language === 2 &&
            /(with|and|is|your)/i.test(exercise.description)
        )
      );
      setExercises(filteredExercises);
    } else {
      setExercises([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchExercises(part);
  }, [part, number]);

  const toggleDetails = (index) => {
    setVisibleDetails((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleExName = (exercisesId) => {
    setId(exercisesId);
  };

  const handleButtonClick = (exerciseId, exerciseName) => {
    updateSelectedExercises(exerciseId, exerciseName);
  };

  const isSelected = (exerciseId) => {
    return selectedExercises.some((exercise) => exercise.id === exerciseId);
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
                  handleButtonClick(exercise.id, exercise.name);
                }}
              >
                +
              </p>
            </div>
            <div
              className={`${styles.exerciseDescription} ${
                visibleDetails[index] ? styles.expanded : ""
              }`}
            >
              <div
                className={styles.exerciseInstructions}
                dangerouslySetInnerHTML={{ __html: exercise.description }}
              ></div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ExerciseList;