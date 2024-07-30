'use client';
import { useSearchParams } from 'next/navigation';
//import styles from './schedule.module.css';
import {auth , storage} from '../../firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { on } from 'events';


const SchedulePage = () => {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [matchingSchedule, setMatchingSchedule] = useState(null);

  useEffect(() => {
    // Fetch schedules.json and set savedSchedules
    fetch('/path/to/schedules.json')
      .then((response) => response.json())
      .then((data) => {
        setSavedSchedules(data);
        // Find the matching schedule
        const schedule = data.find((item) => item.name === name);
        setMatchingSchedule(schedule);
      })
      .catch((error) => console.error("Error fetching schedules.json:", error));
  }, [name]);        

  return (
    <div className={styles.mainContainer}>
      <div className={styles.scheduleDetails}>
      <h1 className={styles.scheduleTitle}>{matchingSchedule.name}</h1>
        <div className={styles.scheduleInfo}>
            {matchingSchedule.exercises.map((exercise) => (
                <div key={exercise.name} className={styles.exercise}>
                <h2>{exercise.name}</h2>
                <p>{exercise.description}</p>
                <p>{exercise.sets} sets of {exercise.reps} reps</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;