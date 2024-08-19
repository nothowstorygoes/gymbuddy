'use client'
import { auth, storage } from "../../firebase";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../../components/navbar/navbar";
import styles from './scheduleListAll.module.css';
import { SwipeableList, SwipeableListItem, SwipeAction, TrailingActions } from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css'; // Ensure this line is present

export default function ScheduleListAll() {
    const [savedSchedules, setSavedSchedules] = useState([]);
    const [user, setUser] = useState(null);
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

    const trailingActions = (scheduleName) => (
        <TrailingActions>
            <SwipeAction
                destructive={true}
                onClick={() => handleDelete(scheduleName)}
                className={styles.itemDelete}
            >
                Delete
            </SwipeAction>
        </TrailingActions>
    );

    return (
        <main className={styles.mainContainer}>
            <div className={styles.stickyDiv}>
                <div className={styles.stickyButton} onClick={handleBack}>Back</div>
            </div>
            <p className={styles.title}>Your Schedules</p>
            <SwipeableList className={styles.list}>
                {savedSchedules.map((schedule) => (
                    <SwipeableListItem
                        key={schedule.name}
                        trailingActions={trailingActions(schedule.name)}
                        className={styles.swipeableListItem}
                        onClick={() => pushWithParams({ schedule })}
                    > <div className={styles.item}>{schedule.name}</div>
                    </SwipeableListItem>
                ))}
            </SwipeableList>
            <Navbar />
        </main>
    );
}