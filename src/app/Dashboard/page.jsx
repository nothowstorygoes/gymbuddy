// pages/index.js
'use client'
import React from 'react';
import BarChart from '../components/chart';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';
import { storage } from '../firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './dashboard.module.css'

const HomePage = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [info, setInfo] = useState("");
    const [proteinArray, setProteinArray] = useState([]);
    const [NrWorkout, setNrWorkout] = useState(0);
    const [username, setUsername] =useState("");
    const [message, setMessage] = useState("");
    const [average, setAverage] =useState(0);
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
          // Download info.json
          const infoRef = ref(storage, `${user.uid}/info.json`);
          getDownloadURL(infoRef)
            .then((url) => fetch(url))
            .then((response) => response.json())
            .then((data) => {
                const proteinIntake= data.proteinIntake;
                setInfo(proteinIntake);
                console.log(info)
                setUsername(data.username)

            })
            .catch((error) => console.error('Error fetching info.json:', error));
          // Download protein.json
          const proteinRef = ref(storage, `${user.uid}/protein.json`);
          getDownloadURL(proteinRef)
              .then((url) => fetch(url))
              .then((response) => response.json())
              .then((data) => {
                  setProteinArray(data); // Directly set the array
                  console.log(data);
              })
              .catch((error) => {
                  console.error('Error fetching the protein.json data:', error);
              });
              const workoutRef = ref(storage, `${user.uid}/workout.json`);
          getDownloadURL(workoutRef)
              .then((url) => fetch(url))
              .then((response) => response.json())
              .then((data) => {
                  setNrWorkout((data.length-1)); // Directly set the array
                  console.log(NrWorkout);
              })
              .catch((error) => {
                  console.error('Error fetching the workout.json data:', error);
              });
}
         else {
          router.push('/login');
        }
      });
  
      return () => unsubscribe();
    }, [router]);

    const [proteinIntakeValues, setProteinIntakeValues] =useState([]);

    useEffect(() => {
        let values =[];
        if (Array.isArray(proteinArray)) {
            values = proteinArray.map(item => item.proteinIntake);
            setProteinIntakeValues(values);
            console.log(values);
        }
        const total = values.reduce((acc, val) => acc + val, 0);
        setAverage(values.length ? total / values.length : 0);
        let infoGoal=parseInt(info);
        console.log(info);
        console.log(infoGoal);
        if(average<=infoGoal && average>=((infoGoal/3)*2))
        {
            setMessage("This week your protein intake is below your goal.")
        }
        if(average<=((infoGoal/3)*2)){
            setMessage("This week your protein intake is less then 2/3 of your goal.")
        }
        if(average<=((infoGoal/3)*1))
        {
            setMessage("You are not eating enough protein, this could be dangerous behaviour for your health.");
        }
        if(average>=infoGoal){
            setMessage("You are doing a good job with your proteins, keep it up! ");
        }
    }, [proteinArray, info]);



    if (!user) {
      return <div>Loading...</div>;
    }

    return (
        <main className={styles.mainContainer}>
            <div className={styles.welcomeTitle}>Ehi {username},</div>
            <div className={styles.chartContainer}><BarChart proteinIntake={info} dataProtein={proteinIntakeValues} /></div>
            <div className={styles.messageGoal}>{message} Your goal is set to {info}.</div>
            <div className={styles.wkNumber}>You worked out&nbsp;&nbsp;<p className={styles.nrWorkout}> {NrWorkout} </p>&nbsp;&nbsp;times this week</div>
            <div className={styles.wkMessage}>Recent studies states that, under the right conditions, you could gain a maximum of </div>
        </main>
    );
};

export default HomePage;
