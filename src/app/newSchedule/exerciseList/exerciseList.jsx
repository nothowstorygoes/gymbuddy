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
  const [currentTheme, setCurrentTheme] = useState("");
  const [svgColor, setSvgColor] = useState("");

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setCurrentTheme(theme);
  }, []);

  useEffect(() => {
    if(currentTheme === "blue")
    {
      setSvgColor("#1b4965");
    }
    else if(currentTheme === "green")
    {
      setSvgColor("#3a5a40");
    }
    else if(currentTheme === "violet")
    {
      setSvgColor("#8187dc");
    }
    else {
      setSvgColor("#370909");
    }
  }, [currentTheme]);

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
              <svg
                width="800px"
                height="800px"
                viewBox="0 0 24 24"
                fill="none"
                className={`${styles.detailsButton} ${
                  visibleDetails[index] ? styles.rotated : ""
                }`}
                onClick={() => toggleDetails(index)}
              >
                <path
                  d="M5.70711 9.71069C5.31658 10.1012 5.31658 10.7344 5.70711 11.1249L10.5993 16.0123C11.3805 16.7927 12.6463 16.7924 13.4271 16.0117L18.3174 11.1213C18.708 10.7308 18.708 10.0976 18.3174 9.70708C17.9269 9.31655 17.2937 9.31655 16.9032 9.70708L12.7176 13.8927C12.3271 14.2833 11.6939 14.2832 11.3034 13.8927L7.12132 9.71069C6.7308 9.32016 6.09763 9.32016 5.70711 9.71069Z"
                  fill={svgColor}
                />
              </svg>
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
