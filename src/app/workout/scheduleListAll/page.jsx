'use client'
import { auth, storage } from "../../firebase";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/navbar";
import styles from './scheduleListAll.module.css';
import {SwipeAction, TrailingActions } from 'react-swipeable-list';
import slStyles from "../../components/swipeableList/swipeableList.module.css"
import SwipeableListComponent from '../../components/swipeableList/swipeableListComponent';
import LoadingSpinner from "../..//components/loadingSpinner/loadingSpinner";

export default function ScheduleListAll() {
    const [savedSchedules, setSavedSchedules] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                console.log("User is signed in");
            } else {
                console.log("No user is signed in");
                router.push("/login");
            }
        });
    }, [router]);

    useEffect(() => {
        if (user) {
            const schedulesRef = ref(storage, `${user.uid}/schedule.json`);
            getDownloadURL(schedulesRef)
                .then((url) => {
                    fetch(url)
                        .then((response) => response.json())
                        .then((data) => {
                            setSavedSchedules(data);
                            setLoading(false);
                        })
                        .catch((error) => console.error("Error fetching schedules.json:", error));
                })
                .catch((error) => console.error("Error getting download URL:", error));
        }
    }, [user]);

    const pushWithParams = (item) => {
        console.log(item);
        if (item.schedule) {
            const params = new URLSearchParams({ name: item.schedule.name.toString() });
            router.push(`/workout/schedule?${params.toString()}`);
        }
    };

    const handleBack = () => {
        router.push("/workout");
        return;
    };

    const handleDelete = (scheduleName) => {
        console.log(`Delete schedule: ${scheduleName}`);
        const updatedSchedules = savedSchedules.filter(schedule => schedule.name !== scheduleName);
        setSavedSchedules(updatedSchedules);
        const schedulesRef = ref(storage, `${user.uid}/schedule.json`);
        uploadString(schedulesRef, JSON.stringify(updatedSchedules))
            .then(() => console.log("Schedule deleted"))
            .catch((error) => console.error("Error deleting schedule:", error));
    };
    const renderScheduleItem = (schedule) => (
        <div onClick={() => pushWithParams({ schedule })} className={slStyles.item}>
            {schedule.name}
        </div>
    );

    const keyExtractor = (schedule) => schedule.name;

    const getTrailingActions = (schedule) => (
        <TrailingActions>
            <SwipeAction
                destructive={true}
                onClick={() => handleDelete(schedule.name)}
                className={slStyles.itemDelete}
            >
                Delete
            </SwipeAction>
        </TrailingActions>
    );

    return (
        <main className={styles.mainContainer}>
            {loading ? <LoadingSpinner/> : ""}
            <div className={styles.stickyDiv}>
                <div className={styles.stickyButton} onClick={handleBack}>Back</div>
            </div>
            <p className={styles.title}>Your Schedules</p>
            <SwipeableListComponent
                items={savedSchedules}
                renderItem={renderScheduleItem}
                keyExtractor={keyExtractor}
                getTrailingActions={getTrailingActions}
            />
            <Navbar />
        </main>
    );
}