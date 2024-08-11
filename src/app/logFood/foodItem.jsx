'use client'
import React, { useState, useRef, useEffect } from 'react';
import styles from './logFood.module.css';

const FoodItem = ({ id, name, weight, calories, unit, onDelete }) => {
  const [swipeState, setSwipeState] = useState({ startX: 0, currentX: 0 });
  const itemRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(0);

  useEffect(() => {
    if (itemRef.current) {
      setItemWidth(itemRef.current.offsetWidth);
    }
  }, []);

  const handleTouchStart = (e) => {
    setSwipeState({ startX: e.touches[0].clientX, currentX: e.touches[0].clientX });
  };

  const handleTouchMove = (e) => {
    const newCurrentX = e.touches[0].clientX;
    if (newCurrentX < swipeState.startX) {
      setSwipeState((prevState) => ({ ...prevState, currentX: newCurrentX }));
    }
  };

  const handleTouchEnd = () => {
    const { startX, currentX } = swipeState;
    const swipeDistance = startX - currentX;

// Only trigger delete if swipe distance is greater than or equal to 90% of the item width
if (swipeDistance >= itemWidth * 0.85) {
    onDelete(id);
  }

    setSwipeState({ startX: 0, currentX: 0 });
  };

  const swipeDistance = swipeState.startX - swipeState.currentX;

  return (
    <div className={styles.foodItemContainer}>
      <div
        className={styles.foodItem}
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${-Math.min(swipeDistance, itemWidth)}px)` }}
      >
        <p className={styles.foodName}>{name}</p>
        <p className={styles.foodWeight}>
          {weight} {unit}
        </p>
        <p className={styles.foodCalories}>{calories} cal</p>
      </div>
      <div className={styles.deleteSwipe} style={{ display: swipeDistance > 0 ? 'flex' : 'none' }}>
        <p>Delete</p>
      </div>
    </div>
  );
};

export default FoodItem;