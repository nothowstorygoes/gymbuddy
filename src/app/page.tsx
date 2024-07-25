import styles from './page.module.css'

export default function LandingPage(){
    return(
      <main className={styles.mainContainer}>
        <div className={styles.name}>gymbuddy</div>
        <div className={styles.optionsContainer}>
          <p className={styles.par}>already have an account?<a href="/gymbuddy/login" className={styles.login}> login</a></p>
          <p className={styles.par}><a href="/gymbuddy/signUp" className={styles.signup}>sign up</a></p>
        </div>
      </main>
    )
}