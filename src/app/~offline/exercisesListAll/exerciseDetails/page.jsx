'use client'
import React from "react";
import { useEffect, useState } from 'react';
import styles from './exerciseDetails.module.css';
import { useRouter } from 'next/navigation'
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";


function OfflineExerciseList() {
    const [exercise, setExercise] = useState([]);
    const router = useRouter();
    const params = useSearchParams();
    const name = params.get('name');
    const scheduleName = params.get('schedule');


    useEffect(() => {
        const saved = localStorage.getItem('schedule');
        if (saved) {
            try {
                const parsedSchedules = JSON.parse(saved);
                const foundSchedule = parsedSchedules.find(schedule => schedule.name === scheduleName);
                console.log(foundSchedule)
                if (foundSchedule) {
                    const foundExercise = foundSchedule.exercises.find(exercise => exercise.name === name);
                    setExercise(foundExercise); 
                    console.log(foundExercise);
                }
            } catch (error) {
                console.error("Failed to parse saved exercise from localStorage:", error);
                setExercise([]);
            }
        }
    }, [name]);

    return (
        <main className={styles.mainContainer}>
            <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={() => router.back()}>
          Back
        </button>
      </div>
            <p className={styles.title}>{exercise.name}</p>
            <div className={styles.exerciseContainer}>
                <Image src={exercise.image} alt={exercise.name} width={300} height={300} className={styles.image} />
                {exercise.instructions && exercise.instructions.map((instruction, index) => (
                        <p key={index} className={styles.instruction}>{instruction}</p>
                ))}
            </div>
        </main>
    );
}

export default function OfflineExerciseListSuspense() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OfflineExerciseList />
        </Suspense>
    );
}