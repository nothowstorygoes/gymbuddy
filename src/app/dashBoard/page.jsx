// pages/index.js
"use client";
import React from "react";
import BarChart from "../components/chart";
import WeightChart from "../components/weightChart";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import { storage } from "../firebase";
import PieChart from "../components/macroChart";
import { ref, getDownloadURL, uploadString } from "firebase/storage";
import { useState, useEffect } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./dashboard.module.css";
import LoadingSpinner from "../components/loadingSpinner/loadingSpinner";
import Navbar from "../components/navbar/navbar";
import { Pie } from "react-chartjs-2";

const HomePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [info, setInfo] = useState("");
  const [proteinArray, setProteinArray] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const [NrWorkout, setNrWorkout] = useState(0);
  const [username, setUsername] = useState("");
  const [calories, setCalories] = useState(0);
  const [message, setMessage] = useState("");
  const [proteinIntakeValues, setProteinIntakeValues] = useState([]);
  const [average, setAverage] = useState(0);
  const [DownloadisDone, setDownloadisDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [goal, setGoalString] = useState("");
  const [mGoal, setMGoal] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [chosenM, setChosenM] = useState("");
  const [mBasal, setMBasal] = useState(0);
  const [theme, setTheme] = useState("default");
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [carbsColor, setCarbsColor] = useState("");
  const [proteinColor, setProteinColor] = useState("");
  const [fatsColor, setFatsColor] = useState("");
  const [caloriesMsg, setCaloriesMsg] = useState("");
  const [weightArray, setWeightArray] = useState([]);
  const [newWeight, setNewWeight] = useState(0);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [infoComplete, setInfoComplete] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "default";
    setTheme(savedTheme);
  }, []);

  const getThemeColors = (theme) => {
    switch (theme) {
      case "blue":
        return {
          pathColor: "#62b6cb",
          trailColor: "#1b4965",
          textColor: "#1b4965",
        };
      case "green":
        return {
          pathColor: "#a3b18a",
          trailColor: "#3a5a40",
          textColor: "#3a5a40",
        };
      case "violet":
        return {
          pathColor: "#bbadff",
          trailColor: "#8187dc",
          textColor: "#8187dc",
        };
      default:
        return {
          pathColor: "#b2675e",
          trailColor: "#370909",
          textColor: "#370909",
        };
    }
  };

  const customStyles = buildStyles(getThemeColors(theme));

  useEffect(() => {
    if (theme === "blue") {
      setCarbsColor("#bee9e8");
      setProteinColor("#00798c");
      setFatsColor("#006ba6");
    } else if (theme === "green") {
      setCarbsColor("#b5e48c");
      setProteinColor("#168aad");
      setFatsColor("#34a0a4");
    } else if (theme === "violet") {
      setCarbsColor("#edf67d");
      setProteinColor("#724cf9");
      setFatsColor("#f896d8");
    } else {
      setCarbsColor("rgba(158, 42, 43, 1)");
      setProteinColor("rgba(216, 87, 42, 1)");
      setFatsColor("rgba(247, 181, 56, 1)");
    }
  }, [theme]);

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
            setInfoComplete(data);
            setInfo(proteinIntake);
            setUsername(data.username);
            setChosenM(data.chosenMeasure);
            setMBasal(data.mBasal);
            setGoalString(data.activity);
          })
          .catch((error) => console.error("Error fetching info.json:", error));
        // Download protein.json
        const foodRef = ref(storage, `${user.uid}/food.json`);
        getDownloadURL(foodRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setProteinArray(data); // Directly set the array
          })
          .catch((error) => {
            console.error("Error fetching the food.json data:", error);
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
        const weightRef = ref(storage, `${user.uid}/weight.json`);
        getDownloadURL(weightRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setWeightArray(data);
            console.table(data);
          })
          .catch((error) => {
            console.error("Error fetching the weight.json data:", error);
          }
        );
      } else {
        router.push("/login");
      }
      setDownloadisDone(true);

      return () => unsubscribe();
    
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

      // Get the current date
      const currentDate = new Date();
      const currentDay = currentDate.getDay();

      // Calculate the date for the Monday of the current week
      const monday = new Date(currentDate);
      monday.setDate(
        currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
      );

      // Calculate the date for the Sunday of the current week
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      if (Array.isArray(proteinArray)) {
        console.log("Protein array:", proteinArray);
        proteinArray.forEach((entry) => {
          const date = new Date(entry.date);
          if (date >= monday && date <= sunday) {
            const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
            const proteinSum = entry.food.reduce(
              (sum, item) => sum + item.protein,
              0
            );
            values[dayOfWeek === 0 ? 6 : dayOfWeek - 1] += proteinSum; // Adjust for Mon-Sun week
          }
        });
      }

      setProteinIntakeValues(values);
      const total = values.reduce((acc, val) => acc + val, 0);
      const average = values.length ? total / values.length : 0;
      setAverage(average);
      let infoGoal = parseInt(info);
      if (average <= infoGoal && average >= (infoGoal / 3) * 2) {
        setMessage("This week your protein intake is below your goal.");
        setLoading(false);
      }
      if (average <= (infoGoal / 3) * 2 && average >= (infoGoal / 3) * 1) {
        setMessage(
          "This week your protein intake is less than 2/3 of your goal."
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

  useEffect(() => {
    if (DownloadisDone) {
      let calGoal = 0;
      switch (goal.toLowerCase()) {
        case "cutting":
          calGoal = -500;
          break;
        case "bulking":
          calGoal = 500;
          break;
        case "maintenance":
          calGoal = 0;
          break;
      }
      setMGoal(mBasal + calGoal);
      setLoadingProgress(false);
    }
  }, [goal, DownloadisDone]);

  useEffect(() => {
    console.log("Updated Goal:", mGoal);
  }, [mGoal]);

  useEffect(() => {
    if (DownloadisDone) {
      const currentDate = new Date().toDateString();

      const matchingEntry = proteinArray.find(
        (entry) => new Date(entry.date).toDateString() === currentDate
      );

      if (matchingEntry) {
        const totalCalories = matchingEntry.food.reduce(
          (sum, item) => sum + item.calories,
          0
        );
        setCalories(totalCalories);
        console.log("Total calories:", totalCalories);
        if (totalCalories <= mGoal && totalCalories >= (mGoal / 3) * 2) {
          setCaloriesMsg("You are on track with your calories., good job!");
        }
        if (totalCalories <= (mGoal / 3) * 2 && totalCalories >= mGoal / 3) {
          setCaloriesMsg("Go eat something, now!");
        }
      } else {
        setCalories(0);
        setCaloriesMsg("You are not eating enough, this is dangerous.");
      }
    }
  }, [proteinArray, DownloadisDone]);

  useEffect(() => {
    if (DownloadisDone) {
      const currentDate = new Date().toDateString();

      const matchingEntry = proteinArray.find(
        (entry) => new Date(entry.date).toDateString() === currentDate
      );

      if (matchingEntry) {
        const totalCarbs = matchingEntry.food.reduce(
          (sum, item) => sum + item.carbo,
          0
        );
        const totalFats = matchingEntry.food.reduce(
          (sum, item) => sum + item.fat,
          0
        );
        const totalProteins = matchingEntry.food.reduce(
          (sum, item) => sum + item.protein,
          0
        );

        setCarbs(totalCarbs);
        setFats(totalFats);
        setProteins(totalProteins);
      } else {
        setCarbs(0);
        setFats(0);
        setProteins(0);
      }
    }
  }, [proteinArray, DownloadisDone]);

  const messages = [
    "Recent studies state that, under the right conditions, you could gain a maximum of 2kg of muscle growth in just 5 weeks, exciting right?",
    "Did you know that sweat is just fat crying? Keep up the good work and you'll see results in no time!",
    "You miss 100% of the shots you don't take. So go ahead and take that shot, you got this!",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Go to the f****ing gym! You can do it and you know it!",
    "The only bad workout is the one that didn't happen. So go ahead and make it happen!",
    "You are one workout away from a good mood, so go ahead and make it happen!",
    "You are stronger than you think, so go ahead and prove it to yourself!",
    "You are one step closer to your goal, keep going!",
    "Transform your body, transform your life. You got this!",
    "Great things never come from comfort zones. So go ahead and push yourself!",
  ];

  const [randomMessage, setRandomMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    setRandomMessage(messages[randomIndex]);
    const date = new Date();
    const currentHour = date.getHours();

    if (currentHour >= 22 || currentHour < 1) {
      if (calories < 1200) {
        setShowModal(true);
      } 
   } 
  }, [calories]);

  

  const weightUpdate = () => {
    const currentDate = new Date().toDateString();
    const newWeightEntry = { date: currentDate, weight: parseInt(newWeight) };
    const updatedWeightArray = [...weightArray];
    const existingEntryIndex = updatedWeightArray.findIndex(
      (entry) => new Date(entry.date).toDateString() === currentDate
    );

    if (existingEntryIndex !== -1) {
      updatedWeightArray[existingEntryIndex] = newWeightEntry;
    } else {
      updatedWeightArray.push(newWeightEntry);
    }

    const weightRef = ref(storage, `${user.uid}/weight.json`);
    const updatedWeightData = JSON.stringify(updatedWeightArray);
    uploadString(weightRef, updatedWeightData)
      .then(() => {
        console.log("Weight data updated successfully");
        setWeightArray(updatedWeightArray);
        setShowWeightModal(false);
      })
      .catch((error) => {
        console.error("Error updating weight data:", error);
      });
        const basalSex = infoComplete.sex === "M" ? 5 : -161;
    const mBasalW =
      infoComplete.chosenMeasure === "imperial"
        ? parseFloat(newWeight) / 2.2
        : parseFloat(newWeight);
    const mBasalH =
      infoComplete.chosenMeasure === "imperial"
        ? parseFloat(infoComplete.height) * 2.54
        : parseFloat(infoComplete.height);
    const activityLevel = [1.2, 1.375, 1.55, 1.725][
      Math.min(Math.floor(infoComplete.goal / 2), 3)
    ];
    const goalLevel =
    infoComplete.activity === "Cutting"
        ? -500
        : infoComplete.activity === "Bulking"
        ? 500
        : 0;
    const mBasal =
      (10 * mBasalW + 6.25 * mBasalH - 5 * infoComplete.age + basalSex) * activityLevel;
    const proteinIntake = Math.floor(((mBasal + goalLevel) * 30) / 100 / 4);
    const updatedInfo = {
      ...infoComplete,
      weight: newWeight,
      mBasal: Math.floor(mBasal),
      proteinIntake,
    };

    const infoRef = ref(storage, `${user.uid}/info.json`);
    uploadString(infoRef, JSON.stringify(updatedInfo))
      .then(() => {
        console.log("Info data updated successfully");
      })
      .catch((error) => {
        console.error("Error updating info data:", error);
      });
  };

  if (loading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <main className={styles.mainContainer}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.mainMainContainer}>
          <div className={styles.welcomeTitle}>Ehi {username},</div>
          {calories === 0 ? (
            <div className={styles.noData}>
              You haven&apos;t logged any food today,
              <br /> no cool charts for you!
            </div>
          ) : (
            <div>
              <div className={styles.chartsContainer}>
                <div className={styles.caloriesChart}>
                  <CircularProgressbarWithChildren
                    value={calories}
                    maxValue={mGoal}
                    styles={customStyles}
                  >
                    <p className={styles.caloriesNumber}>{calories} cal</p>
                  </CircularProgressbarWithChildren>
                </div>
                <div className={styles.pieChart}>
                  <PieChart value1={carbs} value2={fats} value3={proteins} />
                </div>
              </div>

              <div className={styles.macroGoal}>
                <p className={styles.carbs} style={{ color: `${carbsColor}` }}>
                  carbs
                </p>{" "}
                &nbsp; &nbsp;{" "}
                <p className={styles.fats} style={{ color: `${fatsColor}` }}>
                  fats
                </p>{" "}
                &nbsp; &nbsp;{" "}
                <p
                  className={styles.proteins}
                  style={{ color: `${proteinColor}` }}
                >
                  proteins
                </p>
              </div>
            </div>
          )}
          <div className={styles.caloriesGoal}>
            Your goal is to eat {mGoal} calories per day. <br /> {caloriesMsg}
          </div>

          {proteinIntakeValues.length === 0 ? (
            <div className={styles.noData}>
              You haven&apos;t logged anything for over a week..
            </div>
          ) : (
            <div className={styles.chartContainer}>
              <BarChart
                proteinIntake={info}
                dataProtein={proteinIntakeValues}
                chosenMeasure={chosenM}
              />
            </div>
          )}
          <div className={styles.messageGoal}>
            {message} Your goal is set to {infoChMs}.
          </div>
          {NrWorkout === 0 ? (
            <div className={styles.noData}>
              You haven&apos;t worked out yet this week..
            </div>
          ) : (
            <div className={styles.wkNumber}>
              You worked out&nbsp;&nbsp;
              <p className={styles.nrWorkout}> {NrWorkout} </p>&nbsp;&nbsp;times
              this week
            </div>
          )}
          <div className={styles.wkMessage}>{randomMessage}</div>
          <div className={styles.weightChart}>
            <WeightChart datas={weightArray}/>
            <button onClick={()=> setShowWeightModal(true)} className={styles.logWeightButton}>Log Weight</button>
          </div>
          <Navbar />
          {showModal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <p>You haven&apos;t logged any food today, eating less than 1200 calories per day is a dangerous habit.</p>
                <div className={styles.buttonContainer}>
                <button onClick={() => setShowModal(false)} className={styles.closeButton}>Close</button>
                </div>
              </div>
            </div>
          )}
          {showWeightModal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <input type="number" placeholder="Enter your weight" onChange={(e) => setNewWeight(e.target.value)} className={styles.input}/>
                <div className={styles.buttonContainer}>
                <button onClick={() => weightUpdate()} className={styles.buttonSave}>Save</button>
                <button onClick={() => setShowWeightModal(false)} className={styles.buttonClose}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>     
      )}
    </main>
  );
};

export default HomePage;
