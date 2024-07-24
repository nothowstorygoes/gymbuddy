import styles from './page.module.css'

export default function LandingPage(){
    return(
      <main className={styles.mainContainer}>
        <div className={styles.name}>gymbuddy</div>
        <div className={styles.optionsContainer}>
          <p className={styles.par}>already have an account?<a href="/login" className={styles.login}> login</a></p>
          <p className={styles.par}><a href="/signUp" className={styles.signup}>sign Up</a></p>
        </div>
      </main>
    )
}