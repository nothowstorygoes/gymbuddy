'use client'
import React from 'react';
import styles from './logFood.module.css';

const FoodItem = ({ id, name, weight, calories, unit }) => {
  return (
    <div className={styles.foodItemContainer}>
      <div className={styles.foodItem}>
        <p className={styles.foodName}>{name}</p>
        <p className={styles.foodWeight}>
          {weight} {unit}
        </p>
        <p className={styles.foodCalories}>{calories} cal</p>
      </div>
    </div>
  );
};

export default FoodItem;