"use client";
import React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, uploadString, ref } from "firebase/storage";
import { auth, storage } from "../firebase";
import { useState, useEffect } from "react";
import Navbar from "../components/navbar/navbar";
import FoodItem from './foodItem';
import { useRouter } from "next/navigation";

import LoadingSpinner from "../components/loadingSpinner/loadingSpinner";
import styles from "./logFood.module.css";

export default function LogProtein() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState([]);
  const [chosenMeasure, setChosenMeausure] = useState("");
  const [unit, setUnit] = useState("");
  const router = useRouter();
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const infoRef = ref(storage, `${user.uid}/info.json`);
        getDownloadURL(infoRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setChosenMeausure(data.chosenMeasure);
            if (chosenMeasure === "imperial") {
              setUnit("libs");
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

  const onDelete = (id) => {
    const newFoodData = foodData.filter((foodItem) => foodItem.id !== id);
    console.log(newFoodData);
    setFoodData(newFoodData);
    // Get today's date in the required format (assuming 'YYYY-MM-DD')
    const today = new Date().toDateString();
    console.log(today);
    // Update allData with the new food data for today's date
    setAllData((prevAllData) => {
      const index = prevAllData.findIndex((data) => data.date === today);
      if (index !== -1) {
        const newAllData = [...prevAllData];
        newAllData[index] = {
          ...newAllData[index],
          food: newFoodData,
        };
        // Upload the updated allData
        const foodRef = ref(storage, `${user.uid}/food.json`);
        uploadString(foodRef, JSON.stringify(newAllData));
        console.log("deleted");
        return newAllData;
      }
      return prevAllData;
    });
  };

  return (
    <main className={styles.mainContainer}>
      {loading ? <LoadingSpinner /> : ""}
      <div className={styles.title}>
        <p>Nutrition Diary</p>
          <button
            onClick={() => router.push("/logFood/fetchProduct")}
            className={styles.addFood}
          >
            +
          </button>
      </div>
      {loading ? "" :  <div className={styles.foodList}>
        {foodData.map((foodItem, index) => (
          <FoodItem
            key={index}
            id={foodItem.id}
            name={foodItem.name}
            weight={foodItem.weight}
            calories={foodItem.calories}
            unit={unit}
            onDelete={onDelete}
          />
        ))}
      </div>}
      <Navbar />
    </main>
  );
}
