'use client'
import {auth , storage} from "../../firebase"
import { getDownloadURL, ref } from "firebase/storage"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useEffect } from "react"
import Navbar from "../../components/navbar/navbar"
import styles from './scheduleListAll.module.css'

export default function ScheduleListAll() {
    const [savedSchedules, setSavedSchedules] = useState([])
    const [user,setUser] = useState(null);
    const router = useRouter()

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
                console.log("User is signed in")
            } else {
                console.log("No user is signed in")
                router.push("/login");
            }
        })
    },[user, router]);

    useEffect(() => {
        if (user) {
            const schedulesRef = ref(storage, `${user.uid}/schedule.json`);
            getDownloadURL(schedulesRef)
                .then((url) => {
                    fetch(url)
                        .then((response) => response.json())
                        .then((data) => {
                            setSavedSchedules(data)
                        })
                        .catch((error) => console.error("Error fetching schedules.json:", error))
                })
                .catch((error) => console.error("Error getting download URL:", error))
        }
    },[user])

    const pushWithParams = (item) => {
        console.log(item);
        if(item.schedule){
        const params = new URLSearchParams({ name: item.schedule.name.toString() });
        router.push(`/workout/schedule?${params.toString()}`);
      }};

      const handleBack = () => {  
        router.push("/workout");
    return
      };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.stickyDiv}>
                <div className={styles.stickyButton} onClick={handleBack}>Back</div>
            </div>
            <p className={styles.title}>Your Schedules</p>
            {savedSchedules.map((schedule) => {
                return (
                    <div key={schedule.name} onClick={() => pushWithParams({schedule})} className={styles.schedule}>
                        {schedule.name}
                    </div>
                )
            })}
            <Navbar />
        </main>
    )
}