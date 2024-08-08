// pages/index.js
"use client";
import React from "react";
import BarChart from "../components/chart";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import { storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./dashboard.module.css";
import LoadingSpinner from "../components/loadingSpinner/loadingSpinner";
import Navbar from "../components/navbar/navbar";

const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [info, setInfo] = useState("");
  const [proteinArray, setProteinArray] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const [NrWorkout, setNrWorkout] = useState(0);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [proteinIntakeValues, setProteinIntakeValues] = useState([]);
  const [average, setAverage] = useState(0);
  const [DownloadisDone, setDownloadisDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chosenM, setChosenM] = useState("");
  const [schedules, setSchedules] = useState([]);

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
            const proteinIntake = data.proteinIntake;
            setInfo(proteinIntake);
            setUsername(data.username);
            setChosenM(data.chosenMeasure);
          })
          .catch((error) => console.error("Error fetching info.json:", error));
        // Download protein.json
        const proteinRef = ref(storage, `${user.uid}/protein.json`);
        getDownloadURL(proteinRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setProteinArray(data); // Directly set the array
          })
          .catch((error) => {
            console.error("Error fetching the protein.json data:", error);
          });
        // Download workout.json
        const workoutRef = ref(storage, `${user.uid}/workout.json`);
        getDownloadURL(workoutRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setWorkoutData(data); // Directly set the array
          })
          .catch((error) => {
            console.error("Error fetching the workout.json data:", error);
          });
        //Downlaod schedule.json
        const scheduleRef = ref(storage, `${user.uid}/schedule.json`);
        getDownloadURL(scheduleRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setSchedules(data); // Directly set the array
          })
          .catch((error) => {
            console.error("Error fetching the workout.json data:", error);
          });
      } else {
        router.push("/login");
      }
      setDownloadisDone(true);
    });

    return () => unsubscribe();
  }, [router, user, DownloadisDone]);

  let wkMsg = "";
  let infoChMs = "";
  let infonum = 0;
  if (chosenM == "metric") {
    wkMsg = "1.1 kg";
    infoChMs = `${info} gr`;
  } else {
    wkMsg = "2 lbs";
    infonum = Math.floor(parseInt(info) / 453.6);
    infoChMs = `${infonum} lbs`;
  }

  useEffect(() => {
    if (DownloadisDone) {
      const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const values = Array(7).fill(0);
      if (Array.isArray(proteinArray))
        proteinArray.forEach((entry) => {
          const date = new Date(entry.date);
          const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
          const proteinSum = entry.proteinIntake.reduce(
            (sum, item) => sum + item.protein,
            0
          );
          values[dayOfWeek === 0 ? 6 : dayOfWeek - 1] += proteinSum; // Adjust for Mon-Sun week
        });

      setProteinIntakeValues(values);
      const total = values.reduce((acc, val) => acc + val, 0);
      setAverage(values.length ? total / values.length : 0);
      let infoGoal = parseInt(info);
      if (average <= infoGoal && average >= (infoGoal / 3) * 2) {
        setMessage("This week your protein intake is below your goal.");
        setLoading(false);
      }
      if (average <= (infoGoal / 3) * 2 && average >= (infoGoal / 3) * 1) {
        setMessage(
          "This week your protein intake is less then 2/3 of your goal."
        );
        setLoading(false);
      }
      if (average <= (infoGoal / 3) * 1) {
        setMessage(
          "You are not eating enough protein, this could be dangerous behaviour for your health."
        );
        setLoading(false);
      }
      if (average >= infoGoal) {
        setMessage("You are doing a good job with your proteins, keep it up! ");
        setLoading(false);
      }
    }
    // Calculate the start and end of the current week
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay(); // 0 (Sun) to 6 (Sat)
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(
      currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    ); // Set to Monday
    firstDayOfWeek.setHours(0, 0, 0, 0); // Set to start of the day

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Set to Sunday
    lastDayOfWeek.setHours(23, 59, 59, 999); // Set to end of the day

    // Filter workouts that fall within the current week
    const workoutsThisWeek = workoutData.filter((entry) => {
      const workoutDate = new Date(entry.date);
      return workoutDate >= firstDayOfWeek && workoutDate <= lastDayOfWeek;
    });

    setNrWorkout(workoutsThisWeek.length); // Set the count of workouts this week
    console.log("Workouts this week:", workoutsThisWeek);
  }, [proteinArray, info, DownloadisDone, chosenM, workoutData]);

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <main className={styles.mainContainer}>
      <div className={styles.welcomeTitle}>Ehi {username},</div>
      <div className={styles.chartContainer}>
        <BarChart
          proteinIntake={info}
          dataProtein={proteinIntakeValues}
          chosenMeasure={chosenM}
        />
      </div>
      <div className={styles.messageGoal}>
        {message} Your goal is set to {infoChMs}.
      </div>
      <div className={styles.wkNumber}>
        You worked out&nbsp;&nbsp;
        <p className={styles.nrWorkout}> {NrWorkout} </p>&nbsp;&nbsp;times this
        week
      </div>
      <div className={styles.wkMessage}>
        Recent studies states that, under the right conditions, you could gain a
        maximum of {wkMsg} of muscle growth in just 5 weeks,
        <br /> exciting right?
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.buttonLogProtein}>
          <a href="/gymbuddy/logProtein">Log a protein intake</a>
          <img src="/gymbuddy/protein.png" className={styles.imgButton} />
        </button>
        <button className={styles.buttonLogWorkout}>
          <img src="/gymbuddy/workout.png" className={styles.imgButton} />
          <a href="/gymbuddy/logWorkout">Log a workout</a>
        </button>
      </div>
      <Navbar />
    </main>
  );
};

export default HomePage;
