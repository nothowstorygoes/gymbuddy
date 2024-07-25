import styles from '../layout.module.css';

export default function ScreenAlert() {
  return (
    <div className={styles.screenAlert}>
      <p className={styles.name}>gymbuddy</p>
      <p className={styles.msg}>Open the website on a mobile device and download the app!</p>
    </div>
  );
}