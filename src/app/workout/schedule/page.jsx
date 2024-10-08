"use client";
import { useSearchParams } from "next/navigation";
import styles from "./schedule.module.css";
import LineChart from "./chart.jsx";
import { auth, storage } from "../../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar/navbar";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import LoadingSpinner from "@/app/components/loadingSpinner/loadingSpinner";

function SearchParamsSchedule() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [chosenM, setChosenM] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();
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
                workout.schedule && // Ensure schedule exists
                typeof workout.schedule === "object" && // Ensure schedule is an object
                workout.schedule.name === name // Check if schedule.name matches the name prop
            );
            // Set the filtered workouts to state
            setFilteredWorkouts(filteredWorkouts);
            console.log(filteredWorkouts);
          })
          .catch((error) =>
            console.error("Error fetching workout.json:", error)
          );
      });
      setTimeout(() => setLoading(false), 500);}
  }, [name, user]);

  const getExerciseData = (exerciseName) => {
    return filteredWorkouts
      .map((workout) => {
        if (Array.isArray(workout.schedule.exercises)) {
          const exercises = workout.schedule.exercises.filter(
            (exerciseItem) => exerciseItem.name === exerciseName
          );
          return exercises.map((exercise) => {
            const lastSet = exercise.sets[exercise.sets.length - 1];
            return { name: exercise.name, sets: lastSet };
          });
        }
        return null;
      })
      .filter((item) => item !== null)
      .flat();
  };

  const handleBack = () => {
    router.push("/workout");
    return;
  };

  const handleClickExercise = (name, part) => {
    const params = new URLSearchParams({name: name, part: part});
    router.push(`/workout/schedule/exercise?${params.toString()}`)
  }

  const handleSaveOffline = async () => {
   
    const fetchImageAsBase64 = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
      });
  };

  const fetchInstructions = async (part, name) => {
    const instructionsRef = ref(storage, `exercises/${part}.json`);
    const instructionsUrl = await getDownloadURL(instructionsRef);
    const response = await fetch(instructionsUrl);
    const data = await response.json();
    const exercise = data.find(exercise => exercise.name === name);
    return exercise ? exercise.instructions : null;
};

  const updatedExercises = await Promise.all(matchingSchedule.exercises.map(async (exercise) => {
      const imageRef = ref(storage, `exercises/gifs/${exercise.name}.gif`);
      const imageUrl = await getDownloadURL(imageRef);
      const base64Image = await fetchImageAsBase64(imageUrl);
      const instructions = await fetchInstructions(exercise.part, exercise.name);

      return {
          ...exercise,
          image: base64Image,
          instructions
      };
  }));

  const updatedSchedule = {
      ...matchingSchedule,
      exercises: updatedExercises
  };

// Retrieve existing schedules from localStorage
const existingSchedules = localStorage.getItem("schedule");
let schedulesArray = [];

if (existingSchedules) {
    try {
        schedulesArray = JSON.parse(existingSchedules);
    } catch (error) {
        console.error("Failed to parse existing schedules from localStorage:", error);
    }
}

// Append the new schedule object to the array
schedulesArray.push(updatedSchedule);

// Save the updated array back to localStorage
localStorage.setItem("schedule", JSON.stringify(schedulesArray));};
  
  return (
    <main className={styles.mainContainer}>
      {loading ? <LoadingSpinner /> : ""}
      <div className={styles.stickyDiv}>
        <div className={styles.stickyButton} onClick={handleBack}>
          Back
        </div>
       
      </div>
      {matchingSchedule ? (
        <div className={styles.scheduleDetails}>
          <h1 className={styles.scheduleTitle}>{matchingSchedule.name}</h1>
          <div className={styles.scheduleInfo}>
            {matchingSchedule.exercises.map((exercise) => {
              const exerciseData = getExerciseData(exercise.name);
              if (exerciseData.length <= 1)
                {return (
                  <div key={exercise.name} className={styles.exercise}>
                  <button className={styles.exerciseName} onClick={() => handleClickExercise(exercise.name, exercise.part)}>{exercise.name}</button>
                  <div className={styles.progressNone}>
                    There isn&apos;t enough data to show a graph for this exercise.
                  </div>
                  </div>
                );}
              else{
                return (
                  <div key={exercise.name} className={styles.exercise}>
                    <button className={styles.exerciseName} onClick={() => handleClickExercise(exercise.name, exercise.part)}>{exercise.name}</button>
                    <LineChart sets={exerciseData} />
                  </div>
                );}
            })}
          </div>
        </div>
      ) : (
        ""
      )}
       <div className={styles.offlineButton} onClick={handleSaveOffline}>
          Download for offline use
        </div>
      <Navbar />
    </main>
  );
}

export default function SchedulePage() {
  return (
    <Suspense>
      <SearchParamsSchedule />
    </Suspense>
  );
}
