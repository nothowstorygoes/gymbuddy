"use client";
import React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, storage } from "../firebase";
import { useState, useEffect } from "react";
import { uploadBytesResumable } from "firebase/storage";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import styles from "./profile.module.css";
import Navbar from "../components/navbar/navbar";
import LoadingSpinner from "../components/loadingSpinner/loadingSpinner";
import { useRouter } from "next/navigation";

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
  const [svgColor, setSvgColor] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setCurrentTheme(theme);
  }, []);


  useEffect(() => {
    if (currentTheme === "blue") {
      setSvgColor("#1b4965");
    } else if (currentTheme === "green") {
      setSvgColor("#3a5a40");
    } else if (currentTheme === "violet") {
      setSvgColor("#8187dc");
    } else {
      setSvgColor("#370909");
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Download info.json
        const infoRef = ref(storage, `${user.uid}/info.json`);
        getDownloadURL(infoRef)
          .then((url) => fetch(url))
          .then((response) => response.json())
          .then((data) => {
            setInfo(data);
            let goalInfo = 0;
            switch (data.activity.toLowerCase()) {
              case "cutting":
                goalInfo = -500;
                break;
              case "bulking":
                goalInfo = 500;
                break;
              case "maintenance":
                goalInfo = 0;
                break;
              default:
                goalInfo = 0;
            }
            setmGoal(Math.floor(data.mBasal + goalInfo));
            setButtonActivity(data.activity);

            // Set form values with the relevant properties from the fetched data
            setFormValues({
              username: data.username,
              weight: data.weight,
              height: data.height,
              goal: data.goal,
              mBasal: data.mBasal,
              activity: data.activity,
              // Add other relevant properties here
            });
            console.log(data);
            console.log(formValues);
          })
          .catch((error) => console.error("Error fetching info.json:", error));
      }
      if (info.propic==false) {
        setInfo((prevInfo) => ({ ...prevInfo, propic: "" }));
        setTempPropic("/gymbuddy/profile.png");
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } else {
        getDownloadURL(ref(storage, `${user.uid}/proPic.png`)).then((url) => {
          fetch(url)
            .then((res) => res.blob())
            .then((blob) => {
              const img = URL.createObjectURL(blob);
              setTempPropic(img);
              setTimeout(() => {
                setLoading(false);
              }, 500);
            });
        });
      }
    });

    return () => unsubscribe();
  }, [currentTheme]);

  useEffect(() => {
    console.log(info);
  }, [info]);

  const handlePropicEdit = () => {
    console.log("im in");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const proPicRef = ref(storage, `${user.uid}/proPic.png`);
      setTempPropic(URL.createObjectURL(file));
      // Convert the image file to a Base64 string
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
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.error(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            setTempPropic(downloadURL);
          });
        }
      );
      setInfo((prevInfo) => ({ ...prevInfo, propic: true }));
      const infoRef = ref(storage, `${user.uid}/info.json`);
      uploadString(infoRef, JSON.stringify({ ...info, propic: true }));
    };
    input.click(); // Trigger the file input click
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isChanged = false;
    const updatedInfo = { ...info };

    // Check for changes
    for (const key in formValues) {
      if (formValues[key] !== info[key]) {
        updatedInfo[key] = formValues[key];
        isChanged = true;
      }
    }

    if (isChanged) {
      // Update info.json
      let basalSex = 0;
      let mBasalW = 0;
      let mBasalH = 0;
      let activityLevel = 0;
      let goalLevel = 0;
      let mBasal = 0;
      let proteinIntake = 0;

      if (info.sex === "M") {
        basalSex = 5;
      } else {
        basalSex = -161;
      }

      if (info.chosenMeasure === "imperial") {
        mBasalW = parseFloat(updatedInfo.weight) / 2.2;
        mBasalH = parseFloat(updatedInfo.height) * 2.54;
      } else {
        mBasalW = parseFloat(updatedInfo.weight);
        mBasalH = parseFloat(updatedInfo.height);
      }

      switch (parseInt(updatedInfo.goal)) {
        case 0:
          activityLevel = 1.2;
          break;
        case 1:
        case 2:
          activityLevel = 1.375;
          break;
        case 3:
        case 4:
        case 5:
          activityLevel = 1.55;
          break;
        case 6:
        case 7:
          activityLevel = 1.725;
          break;
        default:
          activityLevel = 1.2;
      }
      console.log(updatedInfo.activity);
      switch (updatedInfo.activity) {
        case "Cutting":
          goalLevel = -500;
          break;
        case "Bulking":
          goalLevel = 500;
          break;
        case "Maintenance":
          goalLevel = 0;
          break;
        default:
          goalLevel = 0;
      }
      mBasal =
        (10 * mBasalW + 6.25 * mBasalH - 5 * info.age + basalSex) *
        activityLevel;
      proteinIntake = Math.floor(((mBasal + goalLevel) * 30) / 100 / 4);
      updatedInfo.mBasal = Math.floor(mBasal);
      updatedInfo.proteinIntake = proteinIntake;
      setmGoal(Math.floor(mBasal + goalLevel));
      const infoRef = ref(storage, `${user.uid}/info.json`);
      await uploadString(infoRef, JSON.stringify(updatedInfo));
      setInfo(updatedInfo);
      setIsModalVisible(true);

      // Hide modal after 2 seconds
      setTimeout(() => {
        setIsModalVisible(false);
      }, 1000);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleActivityClick = (activity) => {
    console.log(activity);
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
                  <label className={styles.variable2}>Weight</label>
                  <input
                    type="number"
                    className={styles.input}
                    name="weight"
                    value={formValues.weight}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.variableInput}>
                  <label className={styles.variable}>Height</label>
                  <input
                    type="number"
                    className={styles.input}
                    name="height"
                    value={formValues.height}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.variableInput}>
                  <label className={styles.variable2}>Activity level</label>
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
