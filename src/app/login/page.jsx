'use client'
import styles from  './login.module.css';
import { auth , storage } from '../firebase';
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    deleteUser,
    signInWithPopup,
  } from "firebase/auth";

import { ref, listAll } from 'firebase/storage';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/loadingSpinner/loadingSpinner';

export default function Login() {
    const [email, setEmail] = useState("");
    const [folderExists, setFolderExists] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
  
    // if logged in pushes to home
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && !isLoggingIn && folderExists) {
          setLoading(true);
          setUser(user);
  
          router.push("/dashBoard");
        } else {
          setUser(null);
        }
      });
  
      return () => unsubscribe();
    }, [router]);
    
    if(loading){
      return <LoadingSpinner/>
    }
    //login using firebase auth functions
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        router.push("/dashBoard");
      } catch (error) {
        setErrorMessage(error.code);
      }
    };
  
  
    const handleGoogleLogin = async () => {
      const provider = new GoogleAuthProvider();
      setIsLoggingIn(true);
      try {
        console.log("Starting Google login process...");
        const result = await signInWithPopup(auth, provider);
        console.log("signInWithPopup result:", result);
    
        const user = result.user;
        console.log("User signed in:", user);
    
        const storageRef = ref(storage, user.uid);
        console.log("Checking storage for folder:", user.uid);
    
        const folderExist = await listAll(storageRef)
          .then((res) => {
            console.log("Storage list result:", res);
            return res.items.length > 0 || res.prefixes.length > 0;
          })
          .catch((error) => {
            console.error("Error checking storage:", error);
            return false;
          });
    
        console.log("Folder exists:", folderExist);
        if (folderExist) {
          console.log("Redirecting to /dashBoard");
          router.push("/dashBoard");
        } else {
          console.log("Folder does not exist, deleting user and redirecting to /signUp");
          await deleteUser(user);
          router.push("/signUp");
        }
      } catch (error) {
        setErrorMessage(error.code);
      } finally {
        setIsLoggingIn(false);
      }
    };

    return(
        <main className={styles.mainContainer}>
            <div className={styles.name}>gymbuddy</div>
            <form className={styles.formContainer} onSubmit={handleLogin}>
            <div className={styles.formComplete}>
              <label htmlFor="email-address" className={styles.label}>
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
              />
            </div>

            <div className={styles.formComplete}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
              />
            </div>

            <div>
              <button type="submit" className={styles.submitButton}>
                Login
              </button>
            </div>
          </form>
            <button onClick={handleGoogleLogin} className={styles.googleLoginButton}>
                <img src="/gymbuddy/google.png"/> Login with Google
            </button>
            <button onClick={() => router.push("/signUp")} className={styles.signupButton}>
                Sign up
            </button>

        </main>
    )
}