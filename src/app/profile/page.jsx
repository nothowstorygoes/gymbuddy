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

export default function Profile() {
  const [user, setUser] = useState(null);
  const [info, setInfo] = useState([]);
  const [tempPropic, setTempPropic] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            console.log(data);
          })
          .catch((error) => console.error("Error fetching info.json:", error));
      }
      if (info.propic === null) {
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
  }, []);

  useEffect(() => {
    console.log(info);
  }, [info]);

  const handlePropicEdit = () => {
    if (info.propic === undefined) {
      setInfo((prevInfo) => ({ ...prevInfo, propic: "" }));
    }
    console.log("im in");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const proPicRef = ref(storage, `${user.uid}/proPic.png`);
      setTempPropic(URL.createObjectURL(file));
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

  return (
    <main className={styles.mainContainer}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.mainMainContainer}>
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
              <img
                src="/gymbuddy/edit.png"
                alt="Edit Profile Picture"
                className={styles.editPropicImg}
              />
            </div>
            <div className={styles.infoContainer}>
                
                </div>
          </div>
          <Navbar />
        </div>
        
      )}
    </main>
  );
}
