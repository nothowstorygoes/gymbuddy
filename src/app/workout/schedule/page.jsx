"use client";
import { useSearchParams } from "next/navigation";
import styles from "./schedule.module.css";
import  BarChart  from './chart.jsx';
import { auth, storage } from "../../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

const SchedulePage = () => {
  const searchParams = useSearchParams();
  const [chosenM, setChosenM] = useState("");
  const [user, setUser] = useState(null);
  const name = searchParams.get("name");
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [matchingSchedule, setMatchingSchedule] = useState(null);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        console.log("User is signed in");
      } else {
        console.log("No user is signed in");
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      const schedulesRef = ref(storage, `${user.uid}/schedule.json`);
      getDownloadURL(schedulesRef)
        .then((url) => {
          fetch(url)
            .then((response) => response.json())
            .then((data) => {
              setSavedSchedules(data);
              const schedule = data.find((item) => item.name === name);
              setMatchingSchedule(schedule);
              console.log(matchingSchedule);
            })
            .catch((error) =>
              console.error("Error fetching schedules.json:", error)
            );
        })
        .catch((error) => console.error("Error getting download URL:", error));
      const chosenMetric = ref(storage, `${user.uid}/info.json`);
      getDownloadURL(chosenMetric).then((url) => {
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            if (data.chosenMeasure === "metric") setChosenM("kg");
            else setChosenM("lbs");
            console.log(data);
          })
          .catch((error) => console.error("Error fetching info.json:", error));
      });
      const workoutsRef = ref(storage, `${user.uid}/workout.json`);
      getDownloadURL(workoutsRef).then((url) => {
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            // Filter the array of workout objects
            const filteredWorkouts = data.filter(
              (workout) =>
                workout.schedule &&
                workout.schedule.some(
                  (scheduleItem) => scheduleItem.name === name
                )
            );

            // Set the filtered workouts to state
            setFilteredWorkouts(filteredWorkouts);
            console.log(filteredWorkouts);
          })
          .catch((error) =>
            console.error("Error fetching workout.json:", error)
          );
      });
    }
  }, [name, user]);

  const getExerciseData = (exerciseName) => {
    return filteredWorkouts.map((workout) => {
      return workout.schedule.map((scheduleItem) => {
        if (Array.isArray(scheduleItem.exercises)) {
          const exercise = scheduleItem.exercises.find(
            (exerciseItem) => exerciseItem.name === exerciseName
          );
          if (exercise) {
            const lastSet = exercise.sets[exercise.sets.length - 1];
            return { name: exercise.name, sets: lastSet };
          }
        }
        return null;
      }).filter(item => item !== null);
    }).flat();
  };
  return (
    <div className={styles.mainContainer}>
      {matchingSchedule ? (
        <div className={styles.scheduleDetails}>
          <h1 className={styles.scheduleTitle}>{matchingSchedule.name}</h1>
          <div className={styles.scheduleInfo}>
            {matchingSchedule.exercises.map((exercise) => (
              <div key={exercise.name} className={styles.exercise}>
                <p className={styles.exerciseName}>{exercise.name}</p>
                <p>{exercise.description}</p>
                {exercise.sets.map((set, index) => (
                  <div key={index} className={styles.set}>
                    <p>{`Set n° ${index + 1}`} : &nbsp; &nbsp;</p>
                    <p>{`Reps: ${set.reps}`}&nbsp;&nbsp;</p>
                    <p>{`Weight: ${set.weight} ${chosenM}`} &nbsp;</p>
                  </div>
                ))}
                <BarChart sets={getExerciseData(exercise.name)} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default SchedulePage;