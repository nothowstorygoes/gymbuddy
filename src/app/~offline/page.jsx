import React from 'react';
import styles from '../components/offline.module.css';

export default function Offline() {
    return (
        <main className={styles.offlineContainer}>
        <div className={styles.offline}>
        <h1>Offline</h1>
        <p>It seems you are offline.</p>
        </div>
        </main>
    );
    }