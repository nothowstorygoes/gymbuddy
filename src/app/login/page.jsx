'use client'
import styles from  './login.module.css';
import { auth } from '../firebase';
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
  } from "firebase/auth";
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [user, setUser] = useState(null);
    const router = useRouter();
  
    // if logged in pushes to home
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
  
          router.push("/Dashboard");
        } else {
          setUser(null);
        }
      });
  
      return () => unsubscribe();
    }, [router]);
  
    //login using firebase auth functions
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        router.push("/Dashboard");
      } catch (error) {
        setErrorMessage(error.code);
      }
    };
  
  
    //login with google popup
    const handleGoogleLogin = async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        router.push("/Dashboard");
      } catch (error) {
        setErrorMessage(error.code);
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

        </main>
    )
}