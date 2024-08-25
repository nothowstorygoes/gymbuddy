"use client";
import React from 'react';
import { useEffect, useState } from 'react';
import styles from './offline.module.css';

export default function OfflineSupport() {
    const [savedSchedules, setSavedSchedules] = useState([]);
    const [theme, setTheme] = useState('default');

    useEffect(() => {
        const theme = localStorage.getItem('theme') || 'default';
                const root = document.documentElement;

                if (theme === 'blue') {
                  root.style.setProperty('--primary-color', '#1b4965');
                  root.style.setProperty('--secondary-color', '#62b6cb');
                  root.style.setProperty('--secondary-lowOpacity-color', 'rgba(98, 182, 203, 0.5)');
                  root.style.setProperty('--secondary-svgLoading-color', '#62b6cb');
                } else if (theme === 'green') {
                  root.style.setProperty('--primary-color', '#3a5a40');
                  root.style.setProperty('--secondary-color', '#a3b18a');
                  root.style.setProperty('--secondary-lowOpacity-color' , 'rgba(163, 177, 138, 0.5)');
                  root.style.setProperty('--secondary-svgLoading-color' , '#a3b18a');
                } else if (theme === 'violet') {
                  root.style.setProperty('--primary-color', '#564592');
                  root.style.setProperty('--secondary-color', '#ea698b');
                  root.style.setProperty('--secondary-lowOpacity-color' , 'rgba(234, 105, 139, 0.5)');
                  root.style.setProperty('--secondary-svgLoading-color' , '#bbadff');
                } else {
                  root.style.setProperty('--primary-color', '#370909');
                  root.style.setProperty('--secondary-color', '#b2675e');
                  root.style.setProperty('--secondary-lowOpacity-color' , 'rgba(178, 103, 94, 0.5)');
                  root.style.setProperty('--secondary-svgLoading-color' , '#b2675e');
                }
                setTheme(theme);
    });

    useEffect(() => {
        const saved = localStorage.getItem('savedSchedules');
        if (saved) {
            setSavedSchedules(JSON.parse(saved));
        }
    });

    return (
        <main className={styles.mainContainer}>
            <p className={styles.title}>Offline Support</p>
            <p className={styles.subTitle}>Here are your saved schedules:</p>
            <div className={styles.schedulesContainer}>
                {savedSchedules.length === 0 && (<p className={styles.noData}>No saved schedules</p>)}
             
                    {savedSchedules.map((schedule, index) => (
                        <div key={index}>{schedule}</div>
                    ))}
                
            </div>
        </main>
    );
}