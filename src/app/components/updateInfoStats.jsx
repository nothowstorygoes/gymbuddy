"use client";
import { useState, useEffect } from "react";
import { ref, getDownloadURL, uploadString } from "firebase/storage";
import { storage } from "../firebase";

const useUpdateInfoStats = (uid) => {
  const [info, setInfo] = useState([]);
  const [mGoal, setmGoal] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const url = await getDownloadURL(ref(storage, `${uid}/info.json`));
        const response = await fetch(url);
        const data = await response.json();
        setInfo(data);
      } catch (error) {
        console.error("Error fetching info:", error);
      }
    };

    fetchInfo();
  }, [uid]);

  useEffect(() => {
    if (info.length === 0) return;

    const basalSex = info.sex === "M" ? 5 : -161;
    const mBasalW =
      info.chosenMeasure === "imperial"
        ? parseFloat(info.weight) / 2.2
        : parseFloat(info.weight);
    const mBasalH =
      info.chosenMeasure === "imperial"
        ? parseFloat(info.height) * 2.54
        : parseFloat(info.height);
    const activityLevel = [1.2, 1.375, 1.55, 1.725][
      Math.min(Math.floor(info.goal / 2), 3)
    ];
    const goalLevel =
      info.activity === "Cutting"
        ? -500
        : info.activity === "Bulking"
        ? 500
        : 0;
    const mBasal =
      (10 * mBasalW + 6.25 * mBasalH - 5 * info.age + basalSex) * activityLevel;
    const proteinIntake = Math.floor(((mBasal + goalLevel) * 30) / 100 / 4);
    const updatedInfo = {
      ...info,
      mBasal: Math.floor(mBasal),
      proteinIntake,
    };
    setmGoal(Math.floor(mBasal + goalLevel));

    const infoRef = ref(storage, `${uid}/info.json`);
    uploadString(infoRef, JSON.stringify(updatedInfo))
      .then(() => {
        console.log("Info data updated successfully");
      })
      .catch((error) => {
        console.error("Error updating info data:", error);
      });
  }, [info, uid]);

  return { info, mGoal };
};

export default useUpdateInfoStats;