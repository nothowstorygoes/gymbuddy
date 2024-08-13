"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../../components/navbar/navbar";
import styles from "./productDetails.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth, storage } from "../../../firebase";
import PieChart from "../../../components/macroChart";
import { uploadString } from "firebase/storage";
import { ref, getDownloadURL } from "firebase/storage";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import { useRouter } from "next/navigation";
import "react-circular-progressbar/dist/styles.css";

import LoadingSpinner from "../../../components/loadingSpinner/loadingSpinner";

// Define your custom styles
const customStyles = buildStyles({
  pathColor: "#370909", // Path color
  trailColor: "#ffffff", // Trail color
  textColor: "#370909", // Text color
});

const productDetails = () => {
  const params = useSearchParams();
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weight, setWeight] = useState(100); // Default weight to 100g
  const [chosenMeasure, setChosenMeasure] = useState("metric");
  const router = useRouter();
  const [user, setUser] = useState(null);
  const id = params.get("id");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        const fetchProduct = async () => {
          setError(null);
          try {
            const response = await fetch(
              `https://world.openfoodfacts.org/api/v2/product/${id}`,
              {
                method: "GET",
              }
            );
            const data = await response.json();
            setProduct(data.product);
          } catch (err) {
            setError(err.message);
          } finally {
            setTimeout(() => setLoading(false), 500);
          }
        };
        fetchProduct();

        // Fetch chosenMeasure from the database
        const fetchChosenMeasure = async () => {
          try {
            const url = await getDownloadURL(
              ref(storage, `${user.uid}/info.json`)
            );
            const response = await fetch(url);
            const data = await response.json();
            setChosenMeasure(data.chosenMeasure);
          } catch (err) {
            console.error("Error fetching chosenMeasure:", err);
          }
        };
        fetchChosenMeasure();
      }
    });
    return unsubscribe;
  }, [params, router, storage, user]);

  const handleWeightChange = (e) => {
    setWeight(e.target.value);
  };

  const convertToImperial = (value) => {
    return value * 0.00220462; // Convert grams to pounds
  };

  const getNutrientValue = (value) => {
    let nutrientValue = (value / 100) * weight;
    if (chosenMeasure === "imperial") {
      nutrientValue = convertToImperial(nutrientValue);
    }
    return nutrientValue.toFixed(2);
  };

  const getKcalValue = (value) => {
    let kcalValue = (value / 100) * weight;
    return kcalValue.toFixed(0);
  };

  const handleSave = async () => {
    const date = new Date().toDateString();
    const weightValue = weight;
    const productData = {
      id: product._id,
      name: product.product_name,
      weight: parseInt(weightValue),
      fat: parseInt(getNutrientValue(product.nutriments.fat_100g)),
      protein: parseInt(getNutrientValue(product.nutriments.proteins_100g)),
      carbo: parseInt(getNutrientValue(product.nutriments.carbohydrates_100g)),
      calories: parseInt(getKcalValue(product.nutriments["energy-kcal_100g"])),
    };

    try {
      const foodRef = ref(storage, `${user.uid}/food.json`);
      const url = await getDownloadURL(foodRef);
      const response = await fetch(url);
      const data = await response.json();

      // Check if there is an entry with the current date
      let dateEntry = data.find((entry) => entry.date === date);

      if (dateEntry) {
        // Append the new product to the existing entry
        dateEntry.food.push(productData);
      } else {
        // Create a new entry with the current date and the product
        dateEntry = {
          date: date,
          food: [productData],
        };
        data.push(dateEntry);
      }

      // Convert the updated data to a JSON string
      const updatedData = JSON.stringify(data);

      // Upload the updated data back to the storage using uploadString
      await uploadString(foodRef, updatedData);

      // Redirect to the logFood page
      router.push("/logFood");
    } catch (err) {
      console.error("Error saving food:", err);
    }
  };
  return (
    <main className={styles.mainContainer}>
      <Navbar />
      {loading ? <LoadingSpinner /> : ""}
      <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={() => router.back()}>
          Back
        </button>
      </div>
      <div className={styles.productDetails}>
        <p className={styles.productName}>{product.product_name}</p>
        <input
          type="number"
          value={weight}
          onChange={handleWeightChange}
          className={styles.weightInput}
          placeholder="Enter weight..."
        />
        {product.nutriments ? (
          <div className={styles.nutrientContainer}>
            <div className={styles.charts}>
              <div className={styles.pieChart}>
                <PieChart
                  value1={getNutrientValue(
                    product.nutriments.carbohydrates_100g
                  )}
                  value2={getNutrientValue(product.nutriments.fat_100g)}
                  value3={getNutrientValue(product.nutriments.proteins_100g)}
                />
              </div>
              <div className={styles.circularProgressbar}>
                <CircularProgressbarWithChildren
                  styles={customStyles}
                  value={getKcalValue(product.nutriments["energy-kcal_100g"])}
                  maxValue={getKcalValue(
                    product.nutriments["energy-kcal_100g"]
                  )}
                >
                  <p>
                    {getKcalValue(product.nutriments["energy-kcal_100g"])} kcal
                  </p>
                </CircularProgressbarWithChildren>
              </div>
            </div>
            <div className={styles.nutrientValuesContainer}>
              <div className={styles.nutrient}>
                <p className={styles.nutrientName}> Fat</p>
                <p className={styles.nutrientValue}>
                  <br />
                  {getNutrientValue(product.nutriments.fat_100g)}{" "}
                  {chosenMeasure === "imperial" ? "lbs" : "g"}
                </p>
              </div>
              <div className={styles.nutrient}>
                <p className={styles.nutrientName}>Protein</p>
                <p className={styles.nutrientValue}>
                  <br />
                  {getNutrientValue(product.nutriments.proteins_100g)}{" "}
                  {chosenMeasure === "imperial" ? "lbs" : "g"}
                </p>
              </div>
              <div className={styles.nutrient}>
                <p className={styles.nutrientName}> Carbs</p>
                <p className={styles.nutrientValue}>
                  <br />
                  {getNutrientValue(product.nutriments.carbohydrates_100g)}{" "}
                  {chosenMeasure === "imperial" ? "lbs" : "g"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p>No nutrient information available.</p>
        )}
        {product.nutrient_levels_tags ? (
          <div className={styles.nutrientLevels}>
            <p className={styles.nutrientLevelsTitle}>
              Other nutrients levels:{" "}
            </p>
            <ul>
              {product.nutrient_levels_tags.map((level) => (
                <li key={level} className={styles.nutrientLevel}>
                  {level
                    .replace("en:", "")
                    .replace(/_/g, " ")
                    .replace(/-/g, " ")}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No nutrient levels available.</p>
        )}

        <button className={styles.saveButton} onClick={handleSave}>
          Save
        </button>
      </div>
    </main>
  );
};

export default productDetails;
