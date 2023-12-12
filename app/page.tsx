// app.tsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { toast } from 'react-toastify'

import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, collection, getFirestore } from 'firebase/firestore';
import { auth, app } from "../firebase/clientApp";
import { sendEmailVerification } from 'firebase/auth';
import 'react-toastify/dist/ReactToastify.css';


export default function Home() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', displayName: '' });
  const [isLogin, setIsLogin] = useState(true);

  const db = getFirestore(app);

  //Login Function
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      console.log(router);
      router.push('/chats');
    } catch (error) {
      console.error(error);
    }
  };

  // Register Function
  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      );

      const user = userCredential.user;

      // Send Email 
      await sendEmailVerification(user);

      toast.success("")


      // Store additional user data in Firestore if displayName is available
      if (registerData.displayName) {
        await addUserDataToFirestore(user.uid, registerData.displayName, registerData.email);
      }

      toast.success("User Registered Successfully.")

      router.push('/chats');
    } catch (error) {
      console.error(error);
    }
  };

  const sendEmailVerification = async (user: any) => { // not sure sa type
    try {
      await sendEmailVerification(auth.currentUser);
      console.log("Verification Email Sent");
    } catch (error) {
      console.error(error);
    }
  }


  const addUserDataToFirestore = async (uid: string, displayName: string, email: string) => {
    // Add user data to Firestore
    // You can customize this part based on your Firestore structure
    await setDoc(doc(collection(db, 'users'), uid), {
      uid,
      displayName,
      email,
    });
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  const handleRegistrationVerification = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);

      if (user && !user.emailVerified) {
        console.log("Email not verified. Please check your email and verify your account.");
        return;
      } else {
        console.log("Log In Successfully");
        router.push('/chats');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleGoogleLogin = async () => {
    // Placeholder lang sa ni.
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Welcome to</h3>
        <h1>Haven</h1>
        <h2>A safe space to chat.</h2>
      </div>
      <div className={styles.formContainer}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>{isLogin ? 'Log in' : 'Register'}</h1>
        </div>
        <form className={styles.form}>
          <label className={styles.formLabel}>
            Email:
            <input
              type="text"
              value={isLogin ? loginData.email : registerData.email}
              onChange={(e) =>
                isLogin
                  ? setLoginData({ ...loginData, email: e.target.value })
                  : setRegisterData({ ...registerData, email: e.target.value })
              }
              className={styles.formInput}
            />
          </label>
          <br />
          <label className={styles.formLabel}>
            Password:
            <input
              type="password"
              value={isLogin ? loginData.password : registerData.password}
              onChange={(e) =>
                isLogin
                  ? setLoginData({ ...loginData, password: e.target.value })
                  : setRegisterData({ ...registerData, password: e.target.value })
              }
              className={styles.formInput}
            />
          </label>
          {!isLogin && (
            <>
              <br />
              <label className={styles.formLabel}>
                Display Name:
                <input
                  type="text"
                  value={registerData.displayName}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, displayName: e.target.value })
                  }
                  className={styles.formInput}
                />
              </label>
            </>
          )}
          <br />
          <button
            type="button"
            onClick={isLogin ? handleLogin : handleRegister}
            className={styles.loginButton}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className={styles.toggleText} onClick={handleToggle}>
          {isLogin ? "Don't have an account? Register here." : 'Already have an account? Login here.'}
        </p>
        <div className='horizontalLine'></div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className={styles.formButton}
        >
          <Image
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='48px' height='48px'%3E%3Cpath fill='%23FFC107' d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'/%3E%3Cpath fill='%23FF3D00' d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'/%3E%3Cpath fill='%234CAF50' d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'/%3E%3Cpath fill='%231976D2' d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'/%3E%3C/svg%3E"
            width={50}
            height={50}
            alt="Google Logo" />
          <p>Login with Google</p>
        </button>
      </div>
    </div>
  );
}
