"use client";
import React from "react";
import {storage, auth} from "../firebase";
import {ref, getDownloadURL, uploadString} from "firebase/storage";
import {onAuthStateChanged} from "firebase/auth";
import {useRouter} from "next/navigation";
import LoadingSpinner from "../components/loadingSpinner/loadingSpinner";
import {useEffect, useState} from "react";
import styles from "./logWorkout.module.css";
import Navbar from "../components/navbar/navbar";

export default function LogWorkout() {
    const [savedSchedules, setSavedSchedules] = useState([]);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [item, setItem] = useState(null);
    const [modalClick, setModalClick] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                const schedulesRef = ref(storage, `${user.uid}/schedule.json`);
                getDownloadURL(schedulesRef)
                    .then((url) => fetch(url))
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(data);
                        setSavedSchedules(data);
                    })
                    .catch((error) =>
                        console.error("Error fetching schedules.json:", error)
                    );
            } else {
                router.push("/login");
            }
        });
    }
    , [router]);

    const pushWithParams = ({ item }) => { 
        const params = new URLSearchParams({ name: item.name.toString() });
        router.push(`/logWorkout/editSchedule?${params.toString()}`);
    };

    const logWorkout = ({item}) => {
        console.log(item);
        const workoutRef = ref(storage, `${user.uid}/workout.json`);
        
        getDownloadURL(workoutRef)
            .then((url) => fetch(url))
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                const workoutLog = {
                    date: new Date().toDateString(),
                    schedule: item,
                };
                const newWorkout = data.concat(workoutLog);
                console.log(newWorkout);
                
                // Convert newWorkout to a JSON string
                const newWorkoutJson = JSON.stringify(newWorkout);
                
                // Upload the JSON string to the correct path
                const newWorkoutRef = ref(storage, `${user.uid}/workout.json`);
                uploadString(newWorkoutRef, newWorkoutJson)
                    .then(() => {
                        router.push("/workout");
                    })
                    .catch((error) =>
                        console.error("Error adding workout to workout.json:", error)
                    );
            })
            .catch((error) =>
                console.error("Error fetching workout.json:", error)
            );
    };

        const handleItemClick = (item) => {
            setItem(item);
            setModalClick(true);
        };

        const Modal = ({ item }) => {
            console.log(item);
            console.log(item.name);
            return (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <p>Would you like to edit <b>{item.name}</b> before logging it?</p>
                        <div className={styles.buttonContainer}>
                            
                            <button onClick={() => logWorkout({ item })} className={styles.button}>No</button>
                            <button onClick={() => pushWithParams({ item })} className={styles.button}>Yes</button>
                        </div>
                    </div>
                </div>
            );
        };

    return (
        <main className={styles.mainContainer}>
        {modalClick && item ? <Modal item={item} /> : ""}
        <p className={styles.title}>What schedule did you follow during your workout?</p>
        <div className={styles.scheduleContainer}>
            {savedSchedules.map((item) => (
                <div key={item.name} className={styles.scheduleItem} onClick={() => handleItemClick(item)}>
                    <p>{item.name}</p>
                </div>
            ))}
        </div>
        <Navbar />
    </main>

    );
}

        