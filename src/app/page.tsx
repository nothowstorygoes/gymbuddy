'use client'
import styles from "./page.module.css";
import { auth } from "./firebase";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from './components/loadingSpinner/loadingSpinner';

export default function LandingPage() {
  const [loading,setLoading] = useState(true);
  const router=useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
      } else {
        router.push("/dashBoard");;
      }
    });
  }, []);

  if(loading){
    return <LoadingSpinner/>
  }
  return (
    <main className={styles.mainContainer}>
      <div className={styles.name}>gymbuddy</div>
      <div className={styles.optionsContainer}>
        <p className={styles.par}>
          already have an account?
          <a href="/gymbuddy/login" className={styles.login}>
            {" "}
            login
          </a>
        </p>
        <p className={styles.par}>
          <a href="/gymbuddy/signUp" className={styles.signup}>
            sign up
          </a>
        </p>
      </div>
    </main>
  );
}
