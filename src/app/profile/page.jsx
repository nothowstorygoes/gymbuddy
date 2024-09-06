"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, storage } from "../firebase";
import {
  uploadBytesResumable,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import styles from "./profile.module.css";
import Navbar from "../components/navbar/navbar";
import LoadingSpinner from "../components/loadingSpinner/loadingSpinner";
import { useRouter } from "next/navigation";
import { CircularProgressbar , buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [info, setInfo] = useState([]);
  const [tempPropic, setTempPropic] = useState("");
  const [loading, setLoading] = useState(true);
  const [mGoal, setmGoal] = useState(0);
  const [buttonActivity, setButtonActivity] = useState("");
  const [formValues, setFormValues] = useState({});
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [svgColor, setSvgColor] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);


  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setCurrentTheme(theme);
  }, []);

  
  const getThemeColors = (theme) => {
    switch (theme) {
      case "blue":
        return {
          pathColor: "#62b6cb",
          trailColor: "#ffffff",
          textColor: "#1b4965",
        };
      case "green":
        return {
          pathColor: "#a3b18a",
          trailColor: "#ffffff",
          textColor: "#3a5a40",
        };
      case "violet":
        return {
          pathColor: "#bbadff",
          trailColor: "#ffffff",
          textColor: "#8187dc",
        };
      default:
        return {
          pathColor: "#b2675e",
          trailColor: "#ffffff",
          textColor: "#370909",
        };
    }
  };

  const customStyles = buildStyles(getThemeColors(currentTheme));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const infoRef = ref(storage, `${user.uid}/info.json`);
        getDownloadURL(infoRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setInfo(data);
            const goalInfo =
              data.activity.toLowerCase() === "cutting"
                ? -500
                : data.activity.toLowerCase() === "bulking"
                ? 500
                : 0;
            setmGoal(Math.floor(data.mBasal + goalInfo));
            setButtonActivity(data.activity);
            setFormValues({
              username: data.username,
              weight: data.weight,
              height: data.height,
              goal: data.goal,
              mBasal: data.mBasal,
              activity: data.activity,
            });
            if (data.propic === false) {
              setTempPropic("/gymbuddy/assets/profile.png");
              setTimeout(() => setLoading(false), 500);
            } else {
              getDownloadURL(ref(storage, `${user.uid}/proPic.png`))
                .then((url) => fetch(url))
                .then((res) => res.blob())
                .then((blob) => {
                  const img = URL.createObjectURL(blob);
                  setTempPropic(img);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64String = reader.result;
                    localStorage.setItem("profileImage", base64String);
                  };
                  reader.readAsDataURL(blob);
                  setTimeout(() => setLoading(false), 500);
                });
            }
          })
          .catch((error) => console.error("Error fetching info.json:", error));

        
      }
    });

    return () => unsubscribe();
  }, [currentTheme]);

  useEffect(() => {
    if (currentTheme === "blue") setSvgColor("#1b4965");
    else if (currentTheme === "green") setSvgColor("#3a5a40");
    else if (currentTheme === "violet") setSvgColor("#8187dc");
    else setSvgColor("#370909");
  }, [currentTheme]);

  const handlePropicEdit = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const proPicRef = ref(storage, `${user.uid}/proPic.png`);
      setTempPropic(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        localStorage.setItem("profileImage", base64String);
      };
      reader.readAsDataURL(file);
      const uploadTask = uploadBytesResumable(proPicRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress); // Update upload progress
          console.log(`Upload is ${progress}% done`);
        },
        (error) => console.error(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setTempPropic(downloadURL);
            setUploadProgress(null); // Reset upload progress after completion
          });
        }
      );
      setInfo((prevInfo) => ({ ...prevInfo, propic: true }));
      const infoRef = ref(storage, `${user.uid}/info.json`);
      uploadString(infoRef, JSON.stringify({ ...info, propic: true }));
    };
    input.click();
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isChanged = false;
    const updatedInfo = { ...info };

    for (const key in formValues) {
      if (formValues[key] !== info[key]) {
        updatedInfo[key] = formValues[key];
        isChanged = true;
      }
    }

    if (isChanged) {
      const basalSex = info.sex === "M" ? 5 : -161;
      const mBasalW =
      info.chosenMeasure === "imperial"
          ? parseFloat(info.weight) / 2.2
          : parseFloat(info.weight);
      const mBasalH =
      info.chosenMeasure === "imperial"
          ? parseFloat(formValues.height) * 2.54
          : parseFloat(formValues.height);
      const activityLevel = [1.2, 1.375, 1.55, 1.725][
        Math.min(Math.floor(formValues.goal / 2), 3)
      ];
      const goalLevel =
      formValues.activity === "Cutting"
          ? -500
          : formValues.activity === "Bulking"
          ? 500
          : 0;
      const mBasal =
        (10 * mBasalW + 6.25 * mBasalH - 5 * info.age + basalSex) * activityLevel;
      const proteinIntake = Math.floor(((mBasal + goalLevel) * 30) / 100 / 4);
      setmGoal(Math.floor(mBasal + goalLevel));
      const updatedInfo = {
        ...info,
        height: formValues.height,
        activity: formValues.activity,
        mBasal: Math.floor(mBasal),
        proteinIntake,
      };
  
      const infoRef = ref(storage, `${user.uid}/info.json`);
      uploadString(infoRef, JSON.stringify(updatedInfo))
        .then(() => {
          console.log("Info data updated successfully");
        })
        .catch((error) => {
          console.error("Error updating info data:", error);
        });      setInfo(updatedInfo);
      setIsModalVisible(true);
      setTimeout(() => setIsModalVisible(false), 1000);
    }
  };

  const closeModal = () => setIsModalVisible(false);

  const handleActivityClick = (activity) => {
    setButtonActivity(activity);
    setFormValues((prevValues) => ({
      ...prevValues,
      activity,
    }));
  };

  return (
    <main className={styles.mainContainer}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.mainMainContainer}>
          {isModalVisible && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={closeModal}>
                  x
                </button>
                <p>Your changes have been saved!</p>
              </div>
            </div>
          )}
          <div className={styles.settingsButtonContainer}>
            <button
              className={styles.settingsButton}
              onClick={() => router.push("/profile/settings")}
            >
              Settings
            </button>
          </div>
          <div className={styles.greetingContainer}>
            <p className={styles.greeting}>Good to see you, </p>
            <p className={styles.name}> &nbsp;{info.username}</p>
          </div>
          
          <div className={styles.propicContainer}>
          {uploadProgress !== null && (
            <div className={styles.progressContainer}>
            <CircularProgressbar maxValue={100} value={uploadProgress} styles={customStyles}/>
            </div>
          )}
            <img
              src={tempPropic}
              alt="Profile Picture"
              className={styles.propic}
            />
            <div className={styles.editPropic} onClick={handlePropicEdit}>
              <svg
                width="800px"
                height="800px"
                viewBox="0 0 311.012 311.012"
                className={styles.editPropicImg}
              >
                <g id="pen" transform="translate(-2346.464 -1805.801)">
                  <path
                    id="Path_11"
                    data-name="Path 11"
                    d="M2648.648,1861.794l-47.165-47.164a30.14,30.14,0,0,0-42.627,0l-197.433,197.43a12.111,12.111,0,0,0-3.438,6.937l-11.411,84.069a12.115,12.115,0,0,0,13.634,13.634l84.07-11.411a12.112,12.112,0,0,0,6.937-3.438l197.433-197.43a30.142,30.142,0,0,0,0-42.627Zm-211.677,220.035-64.247,8.72,8.721-64.246,139.906-139.9,55.525,55.526Zm194.543-194.541-37.5,37.5-55.526-55.525,37.5-37.5a5.913,5.913,0,0,1,8.362,0l47.165,47.164a5.91,5.91,0,0,1,0,8.361Z"
                    fill={svgColor}
                  />
                </g>
              </svg>
            </div>
          </div>
          <div className={styles.infoContainer}>
            <p className={styles.mBasal}>
              Your basal metabolism is &nbsp;<span>{info.mBasal}</span>&nbsp;
              calories.
            </p>
            <p className={styles.mGoal}>
              Since you&apos;re in {info.activity.toLowerCase()}, your calories
              intake should be &nbsp;{mGoal}&nbsp; calories.
            </p>
            <form className={styles.formInfos} onSubmit={handleSubmit}>
              <div className={styles.variablesForm}>
                <div className={styles.variableInput}>
                  <label className={styles.variable}>Username</label>
                  <input
                    type="text"
                    className={styles.input}
                    name="username"
                    value={formValues.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.variableInput}>
                  <label className={styles.variable2}>Height</label>
                  <input
                    type="number"
                    className={styles.input}
                    name="height"
                    value={formValues.height}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.variableInput}>
                  <label className={styles.variable}>Activity level</label>
                  <input
                    type="number"
                    className={styles.input}
                    name="goal"
                    value={formValues.goal}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.buttonContainer}>
                  <label className={styles.variableGoal}>Goal</label>
                  <button
                    type="button"
                    className={`${styles.buttonActivity} ${
                      buttonActivity.toLowerCase() === "cutting"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleActivityClick("Cutting")}
                  >
                    Cutting
                  </button>
                  <button
                    type="button"
                    className={`${styles.buttonActivity} ${
                      buttonActivity.toLowerCase() === "bulking"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleActivityClick("Bulking")}
                  >
                    Bulking
                  </button>
                  <button
                    type="button"
                    className={`${styles.buttonActivity} ${
                      buttonActivity.toLowerCase() === "maintenance"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => handleActivityClick("Maintenance")}
                  >
                    Maintenance
                  </button>
                </div>
              </div>
              <button type="submit" className={styles.submitButton}>
                Save Changes
              </button>
            </form>
          </div>
          <Navbar />
        </div>
      )}
    </main>
  );
}
