import React from "react";
import styles from "./loading.module.css";

export default function LoadingSpinner() {
  return (
    <div className={styles.loaderContainer}>
      <span className={styles.loader}></span>
    </div>
  );
}
