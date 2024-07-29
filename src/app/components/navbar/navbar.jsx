import React from "react";
import styles from './navbar.module.css'

export default function Navbar() {
    return(

        <div className={styles.navbar}>
            <div className={styles.navbarContainer}>
                <a href="/gymbuddy/dashBoard" className={styles.navbarButton}><img src="/gymbuddy/dashboard.png" className={styles.navbarImg}/><p>dashboard</p></a>
                <a href="/gymbuddy/logProtein" className={styles.navbarButton}><img src="/gymbuddy/logProtein.png"className={styles.navbarImg}/><p>log</p></a>
                <a href="/gymbuddy/logWorkout" className={styles.navbarButton}><img src="/gymbuddy/logWorkout.png"className={styles.navbarImg}/><p>work out</p></a>
                <a href="/gymbuddy/profile" className={styles.navbarButton}><img src="/gymbuddy/profile.png"className={styles.navbarImg}/><p>profile</p></a>
            </div>
            </div>
    )
}