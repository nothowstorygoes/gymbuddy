'use client'
import React from "react";
import { useEffect, useState } from 'react';
import styles from './exerciseListAll.module.css';
import { useRouter } from 'next/navigation'
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


function OfflineExerciseList() {
    const [savedExercises, setSavedExercises] = useState([]);
    const router = useRouter();
    const params = useSearchParams();
    const name = params.get('name');


    useEffect(() => {
        const saved = localStorage.getItem('schedule');
        if (saved) {
            try {
                const parsedSchedules = JSON.parse(saved);
                const foundSchedule = parsedSchedules.find(schedule => schedule.name === name);
                if (foundSchedule) {
                    setSavedExercises(foundSchedule.exercises || []);
                }
            } catch (error) {
                console.error("Failed to parse saved schedules from localStorage:", error);
                setSavedExercises([]);
            }
        }
    }, [name]);

    const pushWithName = (name, schedule) => {
        const params = new URLSearchParams({name:  name , schedule : schedule });
        router.push(`/~offline/exercisesListAll/exerciseDetails?${params}`)}


    return (
        <main className={styles.mainContainer}>
            <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={() => router.back()}>
          Back
        </button>
      </div>
            <p className={styles.title}>Exercises for <b>{name}</b></p>
            <div className={styles.exerciseContainer}>
                {savedExercises.length > 0 ? (
                    savedExercises.map((exercise, index) => (
                        <div key={index} className={styles.exercise}>
                            <p className={styles.exerciseName} onClick={() => pushWithName(exercise.name, name)}>{exercise.name}</p>
                        </div>
                    ))
                ) : (
                    <p>No saved exercises</p>
                )}
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