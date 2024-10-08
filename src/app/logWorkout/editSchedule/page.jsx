"use client";
import React, { useEffect } from "react";
import { storage, auth } from "../../firebase";
import { ref, getDownloadURL, uploadString } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./editSchedule.module.css";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
 
function EditScheduleChild() {
  const search = useSearchParams();
  const [user, setUser] = useState(null);
  const router = useRouter();
  const scheduleName = search.get("name");
  const [schedule, setSchedule] = useState(null);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const scheduleRef = ref(storage, `${user.uid}/schedule.json`);
        getDownloadURL(scheduleRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            const schedule = data.find(
              (schedule) => schedule.name === scheduleName
            );
            setSchedule(schedule);
          })
          .catch((error) =>
            console.error("Error fetching schedules.json:", error)
          );
      } else {
        router.push("/login");
      }
    });
  }, [router, scheduleName]);

  const handleSetChange = (exerciseId, setIndex, field, value) => {
    const updatedSchedule = { ...schedule };
    const exercise = updatedSchedule.exercises.find(
      (ex) => ex.id === exerciseId
    );
    exercise.sets[setIndex][field] = value;
    setSchedule(updatedSchedule);
  };

  const handleAddSet = (exerciseId) => {
    const updatedSchedule = { ...schedule };
    const exercise = updatedSchedule.exercises.find(
      (ex) => ex.id === exerciseId
    );

    // Get the last set's values
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet = {
      reps: lastSet ? lastSet.reps : "",
      weight: lastSet ? lastSet.weight : "",
    };

    exercise.sets.push(newSet);
    setSchedule(updatedSchedule);
  };

  const handleRemoveSet = (exerciseId) => {
    const updatedSchedule = { ...schedule };
    const exercise = updatedSchedule.exercises.find(
      (ex) => ex.id === exerciseId
    );

    // Check if the exercise has more than one set
    if (exercise.sets.length > 1) {
        // Remove the last set
        exercise.sets.pop();
        setSchedule(updatedSchedule);
    }
};

  if (!schedule) {
    return <LoadingSpinner />;
  }

  const handleSave = () => {
    const savedData = {
      date: new Date().toDateString(),
      schedule: {
        name: schedule.name,
        exercises: schedule.exercises.map((exercise) => ({
          name: exercise.name,
          sets: exercise.sets.map((set) => ({
            reps: set.reps,
            weight: set.weight,
          })),
        })),
      },
    };
    console.log(savedData);
    const workoutOldRef = ref(storage, `${user.uid}/workout.json`);
    getDownloadURL(workoutOldRef)
      .then((url) => fetch(url))
      .then((response) => response.json())
      .then((data) => {
        const newWorkout = data.concat(savedData);
        const newWorkoutJson = JSON.stringify(newWorkout);
        const newWorkoutRef = ref(storage, `${user.uid}/workout.json`);
        uploadString(newWorkoutRef, newWorkoutJson)
          .then(() => {
            router.push("/workout");
          })
          .catch((error) =>
            console.error("Error adding workout to workout.json:", error)
          );
      });
    // You can send savedData to a server or save it locally
  };

  const handleSaveWithChanges = () => {
    const scheduleRef = ref(storage, `${user.uid}/schedule.json`);
    getDownloadURL(scheduleRef)
      .then((url) => fetch(url))
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Find the schedule with the matching name
        const scheduleIndex = data.findIndex(
          (schedule) => schedule.name === scheduleName
        );
        if (scheduleIndex !== -1) {
          // Remove the old schedule
          data.splice(scheduleIndex, 1);
        }
        // Set the new schedule
        const newSchedule = {
          name: schedule.name,
          exercises: schedule.exercises.map((exercise) => ({
            id: exercise.id,
            part: exercise.part,
            name: exercise.name,
            sets: exercise.sets.map((set) => ({
              reps: set.reps,
              weight: set.weight,
            })),
          })),
        };
        // Add the new schedule to the data
        data.push(newSchedule);
        // Convert the updated data to JSON
        const updatedDataJson = JSON.stringify(data);
        // Upload the new data to schedule.json
        uploadString(scheduleRef, updatedDataJson)
          .then(() => {
            console.log("Schedule updated successfully");
            handleSave();
          })
          .catch((error) => {
            console.error("Error uploading updated schedule:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching schedule.json:", error);
      });
  };

  return (
    <main className={styles.mainContainer}>
            <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={() => router.back()}>
          Back
        </button>
      </div>
      <p className={styles.title}>{schedule.name}</p>
      <hr className={styles.divider}/>
      {schedule.exercises.map((exercise) => (
        <div key={exercise.id} className={styles.exerciseInfoSelected}>
          <div className={styles.exerciseName}>{exercise.name}</div>
          <div className={styles.setsContainer}>
          <form className={styles.formContainer}>
            {exercise.sets.map((set, setIndex) => (
              <div key={setIndex} className={styles.exerciseFormInfoSet}>
                <div className={styles.formInfo}>
                  <label className={styles.formLabel}>Reps</label>
                  <input
                    className={styles.input}
                    type="number"
                    required
                    value={set.reps}
                    placeholder="Reps"
                    onChange={(e) =>
                      handleSetChange(
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
                    value={set.weight}
                    placeholder="Weight"
                    onChange={(e) =>
                      handleSetChange(
                        exercise.id,
                        setIndex,
                        "weight",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </form>
          </div>
          <div className={styles.buttonContainer}>
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => handleRemoveSet(exercise.id)}
            >
              Remove
            </button>
            <button
              type="button"
              className={styles.addButton}
              onClick={() => handleAddSet(exercise.id)}
            >
              Add New
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className={styles.savedSchedule}
        onClick={()=> setModal(true)}
      >
        Save Schedule
      </button>
      {modal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <p>Do you wish to save the changes to the schedule <b>permanently</b>?</p>
                <div className={styles.buttonContainer}>
                <button onClick={() => {setModal(false) ; handleSave()}} className={styles.closeButton}>No</button>
                <button onClick={() => {setModal(false) ; handleSaveWithChanges()}} className={styles.saveButton}>Yes</button>

                </div>
              </div>
            </div>
          )}
    </main>
  );
}


export default function EditSchedule() {
    return (
        <Suspense>
        <EditScheduleChild />
        </Suspense>
    );
    }