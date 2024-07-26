"use client";
import React, { useState } from "react";
import styles from "./signup.module.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { storage } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ref, uploadString } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [chosenProvider, setChosenProvider] = useState(null);
  const [isNext, setIsNext] = useState(false);
  const [isNextInfo, setIsNextInfo] = useState(false);
  const [isNextBody, setIsNextBody] = useState(false);
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [activity, setActivity] = useState("");
  const [chosenMeasure, setChosenMeasure] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  //signup using email and password, other info will be added following steps
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (chosenProvider === "email") {
      if (confirmPassword !== password) {
        setPasswordError("Passwords do not match");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
    }
    const userInfo = {
      email: email,
      username: username,
      chosenMeasure: chosenMeasure,
      age: age,
      sex: sex,
      height: height,
      weight: weight,
      goal: goal,
      activity: activity,
    };
    const uid = auth.currentUser.uid;
    const userRef = ref(storage, `${uid}/info.json`);
    await uploadString(userRef, JSON.stringify(userInfo));
  };

  //handler to call Google Auth Provider
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
    } catch (error) {
      setErrorMessage(error.code);
    }
  };
  //Handler to switch container based on selected provider
  const handleProviderClick = (provider) => {
    setChosenProvider(provider);
    setIsNext(true);
    if (provider === "google") {
      handleGoogleLogin();
    }
  };
  //Handler to switch container to next step
  const nextStep = (e) => {
    e.preventDefault();
    setIsNextInfo(true);
  };

  const nextStep2 = (e) => {
    e.preventDefault();
    setIsNextBody(true);
  };

  const nextStep3 = (e) => {
    e.preventDefault();
    setIsDone(true);
    handleSignUp(e);
  };

  return (
    <main className={styles.mainContainer}>
      <div className={`${styles.firstContainer} ${isNext ? styles.next : ""}`}>
        <h1 className={styles.title}>sign up options</h1>
        <div className={styles.buttonContainer}>
          <button
            className={styles.provider}
            onClick={() => handleProviderClick("email")}
          >
            <img src="/gymbuddy/email.png" className={styles.providerIcon} />
            <p>email and password</p>
          </button>
          <button
            className={styles.provider}
            onClick={() => handleProviderClick("google")}
          >
            <img src="/gymbuddy/google.png" className={styles.providerIcon} />
            <p>google</p>
          </button>
        </div>
      </div>
      <div
        className={`${styles.secondContainer} ${isNext ? styles.next : ""} ${
          isNextInfo ? styles.slideOut : ""
        }`}
      >
        {chosenProvider === "email" ? (
          <div className={styles.emailContainer}>
            <form className={styles.formContainer} onSubmit={nextStep}>
              <div className={styles.formComplete}>
                <label htmlFor="email-address" className={styles.label}>
                  email address
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
                <label htmlFor="username" className={styles.label}>
                  username
                </label>
                <input
                  id="username"
                  name="username"
                  type="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.formComplete}>
                <label htmlFor="password" className={styles.label}>
                  password
                </label>
                <input
                  id="password"
                  name="PSW"
                  type="text"
                  required
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputFieldPSW}
                />
              </div>

              <div className={styles.formComplete}>
                <label htmlFor="ConfirmPassword" className={styles.label}>
                  confirm password
                </label>
                <input
                  id="ConfirmPassword"
                  autoComplete="off"
                  name="confirmPSW"
                  type="text"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.inputFieldPSW}
                />
              </div>
              {passwordError && <p className={styles.error}>{passwordError}</p>}
              <div>
                <button type="submit" className={styles.submitButton}>
                  <p>next</p>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className={styles.googleContainer}>
            <p className={styles.titleGoogle}>
              You &apos; re almost there.. <br />
              Set your username
            </p>
            <form className={styles.formContainerGoogle} onSubmit={nextStep}>
              <div className={styles.formComplete}>
                <label htmlFor="username" className={styles.labelGoogle}>
                  username
                </label>
                <input
                  id="username"
                  name="username"
                  type="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.inputFieldGoogle}
                />
              </div>
              <div>
                <button type="submit" className={styles.submitButtonGoogle}>
                  <p>next</p>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <div
        className={`${styles.thirdContainer} ${
          isNextInfo ? styles.next2 : ""
        } ${isNextBody ? styles.slideOut : ""}`}
      >
        <div className={styles.infoContainer}>
          <form className={styles.formContainer} onSubmit={nextStep2}>
            <div className={styles.formLeft}>
              <div className={styles.formComplete}>
                <label htmlFor="age" className={styles.label}>
                  age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={styles.inputFieldSign3}
                />
              </div>
              <div className={styles.formSex}>
                <p className={styles.labelSex}>Sex</p>
                <button
                  type="button"
                  onClick={() => {
                    setSex("M"), setIsNextBody(false);
                  }}
                  className={`${styles.buttonSex} ${
                    sex === "M" ? styles.clicked : ""
                  }`}
                >
                  <p>M</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSex("F"), setIsNextBody(false);
                  }}
                  className={`${styles.buttonSex} ${
                    sex === "F" ? styles.clicked : ""
                  }`}
                >
                  <p>F</p>
                </button>
              </div>
            </div>
            <div className={styles.formRigth}>
              <div className={styles.formComplete}>
                <label htmlFor="age" className={styles.labelSign3}>
                  height
                </label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className={styles.inputFieldSign3}
                />
              </div>
              <div className={styles.formComplete}>
                <label htmlFor="weigth" className={styles.labelSign3}>
                  weight
                </label>
                <input
                  id="weight"
                  name="weight"
                  type="string"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className={styles.inputFieldSign3}
                />
              </div>
            </div>
            <div className={styles.formMeasures}>
              <button
                type="button"
                onClick={() => {
                  setChosenMeasure("metric"), setIsNextBody(false);
                }}
                className={`${styles.buttonMeasure} ${
                  chosenMeasure === "metric" ? styles.clicked : ""
                }`}
              >
                <p>metric</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChosenMeasure("imperial"), setIsNextBody(false);
                }}
                className={`${styles.buttonMeasure} ${
                  chosenMeasure === "imperial" ? styles.clicked : ""
                }`}
              >
                <p>imperial</p>
              </button>
            </div>
            <button type="submit" className={styles.submitButton2}>
              next
            </button>
          </form>
        </div>
      </div>
      <div
        className={`${styles.fourthContainer} ${
          isNextBody ? styles.next3 : ""
        } ${isDone ? styles.slideOut4 : ""}`}
      >
        <form className={styles.formContainer} onSubmit={nextStep3}>
          <div className={styles.formGoal}>
            <label htmlFor="goal" className={styles.labelActivity}>
              How many times do you workout per week?
            </label>
            <input
              id="goal"
              name="goal"
              type="string"
              required
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className={styles.inputFieldGoal}
            />
          </div>
          <div className={styles.formActivity}>
            <p className={styles.labelActivity2}>What is your goal?</p>
            <div className={styles.activityContainer}>
              <button
                type="button"
                onClick={() => {
                  setActivity("leaner");
                }}
                className={`${styles.buttonActivity} ${
                  activity === "leaner" ? styles.clicked : ""
                }`}
              >
                leaner
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivity("powerful");
                }}
                className={`${styles.buttonActivity} ${
                  activity === "powerful" ? styles.clicked : ""
                }`}
              >
                powerful
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivity("healthier");
                }}
                className={`${styles.buttonActivity} ${
                  activity === "healthier" ? styles.clicked : ""
                }`}
              >
                healthier
              </button>
            </div>
          </div>
          <button type="submit" className={styles.submitButton3}>
            Done
          </button>
        </form>
      </div>
      <div className={`${styles.doneContainer} ${isDone ? styles.next4 : ""}`}>
        <h1 className={styles.doneTitle}>You are all set!</h1>
        <p className={styles.doneText}>
          You are now ready to start your fitness journey. <br />
          <br />
          <br /> Welcome to{" "}
        </p>
        <p className={styles.doneLogo}>GymBuddy!</p>

        <button
          className={styles.doneButton}
          onClick={() => router.push("/dashBoard")}
        >
          <p>Get Started</p>
        </button>
      </div>
    </main>
  );
}
