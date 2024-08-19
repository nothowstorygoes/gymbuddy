import React, { useState, useEffect } from "react";
import styles from "./exerciseList.module.css";
import Image from "next/image";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const ExerciseList = ({
  part,
  updateSelectedExercises,
  selectedExercises,
  setLoading,
}) => {
  const [exercises, setExercises] = useState([]);
  const [visibleDetails, setVisibleDetails] = useState({});
  const [gifUrls, setGifUrls] = useState({});
  const [currentTheme, setCurrentTheme] = useState("");
  const [svgColor, setSvgColor] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setCurrentTheme(theme);
  }, []);

  useEffect(() => {
    if (currentTheme === "blue") {
      setSvgColor("#1b4965");
    } else if (currentTheme === "green") {
      setSvgColor("#3a5a40");
    } else if (currentTheme === "violet") {
      setSvgColor("#8187dc");
    } else {
      setSvgColor("#370909");
    }
  }, [currentTheme]);

  const fetchExercises = async (part) => {
    console.log("Fetching exercises...");
    try {
      const exerciseRef = ref(storage, `exercises/${part}.json`);
      const url = await getDownloadURL(exerciseRef);
      const response = await fetch(url);
      const data = await response.json();

      setExercises(data);
      setVisibleDetails({});
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setExercises([]);
    }
    setLoading(false);
  };

  const fetchGifUrl = async (exerciseId) => {
    try {
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      const trimmedGifUrl = exercise.gifUrl.trimStart();
      const gifRef = ref(storage, `exercises/gifs/${trimmedGifUrl}`);
      console.log("Fetching gif:", gifRef);
      const gifUrl = await getDownloadURL(gifRef);

      setGifUrls((prevGifUrls) => ({
        ...prevGifUrls,
        [exerciseId]: gifUrl,
      }));
    } catch (error) {
      console.error("Error fetching gif:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchExercises(part);
  }, [part]);

  const toggleDetails = async (exerciseId) => {
    setVisibleDetails((prevState) => ({
      ...prevState,
      [exerciseId]: !prevState[exerciseId],
    }));

    if (!gifUrls[exerciseId]) {
      await fetchGifUrl(exerciseId);
    }
  };

  const handleButtonClick = (
    exerciseId,
    exerciseName,
    exerciseGif,
    exerciseInstruction
  ) => {
    updateSelectedExercises(
      exerciseId,
      exerciseName,
      exerciseGif,
      exerciseInstruction
    );
  };

  const isSelected = (exerciseId) => {
    return selectedExercises.some((exercise) => exercise.id === exerciseId);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={styles.listContainer}>
      <input
        type="text"
        placeholder="Filter exercises..."
        value={filter}
        onChange={handleFilterChange}
        className={styles.filterInput}
      />
      {Array.isArray(filteredExercises) &&
        filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
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
                  visibleDetails[exercise.id] ? styles.rotated : ""
                }`}
                onClick={() => toggleDetails(exercise.id)}
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
                  handleButtonClick(exercise.id, exercise.name, part);
                }}
              >
                +
              </p>
            </div>
            <div
              className={`${styles.exerciseDescription} ${
                visibleDetails[exercise.id] ? styles.expanded : ""
              }`}
            >
              {visibleDetails[exercise.id] &&
                (gifUrls[exercise.id] ? (
                  <Image
                    src={gifUrls[exercise.id]}
                    alt=""
                    className={styles.exerciseGif}
                    width={200}
                    height={200}
                    priority={false}
                  />
                ) : (
                  <p>Loading gif...</p>
                ))}
              <div className={styles.exerciseInstructions}>
                {exercise.instructions.map((instruction, index) => (
                  <p key={index}>{instruction}</p>
                ))}
              </div>{" "}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ExerciseList;
