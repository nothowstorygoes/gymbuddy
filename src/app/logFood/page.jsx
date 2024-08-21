"use client";
import React, { use } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, uploadString, ref } from "firebase/storage";
import { auth, storage } from "../firebase";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar/navbar";
import FoodItem from "./foodItem";
import SwipeableListComponentFood from "../components/swipeableList//foodList/swipeablefood";
import { SwipeAction, TrailingActions } from "react-swipeable-list";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../components/loadingSpinner/loadingSpinner";
import styles from "./logFood.module.css";

export default function LogFood() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState([]);
  const [chosenMeasure, setChosenMeasure] = useState("");
  const [unit, setUnit] = useState("");
  const router = useRouter();
  const [allData, setAllData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [theme, setTheme] = useState("");
  const [svgColor, setSvgColor] = useState("");

  useEffect(() => {
    setTheme(localStorage.getItem("theme"));
  }, []);

  useEffect(() => {
    if (theme === "default") {
      setSvgColor("#b2675e");
    }
    if (theme === "blue") {
      setSvgColor("#62b6cb");
    }
    if (theme === "green") {
      setSvgColor("#a3b18a");
    }
    if (theme === "violet") {
      setSvgColor("#bbadff");
    }
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const infoRef = ref(storage, `${user.uid}/info.json`);
        getDownloadURL(infoRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setChosenMeasure(data.chosenMeasure);
            if (chosenMeasure === "imperial") {
              setUnit("lbs");
            } else {
              setUnit("g");
            }
          });
        const foodRef = ref(storage, `${user.uid}/food.json`);
        getDownloadURL(foodRef)
          .then((url) => {
            fetch(url)
              .then((response) => response.json())
              .then((data) => {
                console.log(data);
                setAllData(data);
                const currentDate = new Date().toDateString();
                const matchingEntry = data.find(
                  (entry) => new Date(entry.date).toDateString() === currentDate
                );

                if (matchingEntry) {
                  setFoodData(matchingEntry.food);
                } else {
                  setFoodData([]);
                }

                setLoading(false);
              });
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
          });
      } else setUser(null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const matchingEntry = allData.find(
      (entry) =>
        new Date(entry.date).toDateString() === currentDate.toDateString()
    );

    if (matchingEntry) {
      setFoodData(matchingEntry.food);
    } else {
      setFoodData([]);
    }
  }, [allData, currentDate]);

  const onDelete = (id) => {
    const newFoodData = foodData.filter((foodItem) => foodItem.id !== id);
    console.log(newFoodData);
    setFoodData(newFoodData);
    setAllData((prevAllData) => {
      const index = prevAllData.findIndex((data) => data.date === currentDate.toDateString());
      if (index !== -1) {
        const newAllData = [...prevAllData];
        newAllData[index] = {
          ...newAllData[index],
          food: newFoodData,
        };
        const foodRef = ref(storage, `${user.uid}/food.json`);
        uploadString(foodRef, JSON.stringify(newAllData));
        console.log("deleted");
        return newAllData;
      }
      return prevAllData;
    });
  };

  const truncateName = (name) => {
    return name.length > 18 ? name.substring(0, 15) + "..." : name;
  };

  const handlePrevDate = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDate = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + 1);
      return newDate;
    });
  };

  const formattedDate = currentDate.toDateString();

  const addFood = (date) => {
    const params = new URLSearchParams({ date: date });
    router.push(`/logFood/fetchProduct?${params.toString()}`);
  };

  const renderItem = (foodItem) => (
    <FoodItem
      id={foodItem.id}
      name={truncateName(foodItem.name)}
      weight={foodItem.weight}
      calories={foodItem.calories}
      unit={unit}
      onDelete={onDelete}
    />
  );

  const keyExtractor = (foodItem) => foodItem.id;

  const getTrailingActions = (foodItem) => (
    <TrailingActions>
      <SwipeAction onClick={() => onDelete(foodItem.id)}>
        <div className={styles.deleteSwipe}><p>Delete</p></div>
      </SwipeAction>
    </TrailingActions>
  );

  return (
    <main className={styles.mainContainer}>
      {loading ? <LoadingSpinner /> : ""}
      <div className={styles.dateContainer}>
        <button onClick={handlePrevDate} className={styles.buttonDate}>
          <svg
            width="40px"
            height="40px"
            viewBox="0 0 1024 1024"
          >
            <path
              d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z"
              fill={svgColor}
            />
          </svg>
        </button>
        <p className={styles.date}>{formattedDate}</p>
        <button onClick={handleNextDate} className={styles.buttonDate}>
          <svg
            width="40px"
            height="40px"
            viewBox="0 0 1024 1024"
          >
            <path
              d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
              fill={svgColor}
            />
          </svg>
        </button>
      </div>
      <div className={styles.title}>
        <p>Nutrition Diary</p>
        <button
          onClick={() => addFood(formattedDate)}
          className={styles.addFood}
        >
          +
        </button>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.foodList}>
          {foodData.length === 0 ? (
            <div className={styles.noData}>
              No meals present in our records..
            </div>
          ) : (
            <SwipeableListComponentFood
              items={foodData}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              getTrailingActions={getTrailingActions}
            />
          )}
        </div>
      )}
      <Navbar />
    </main>
  );
}