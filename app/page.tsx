// app.tsx
"use client";
import React, { useState } from "react";
import styles from "./page.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, collection, getFirestore } from "firebase/firestore";
import { auth, app } from "../firebase/clientApp";
import { sendEmailVerification } from "firebase/auth";
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function Home() {
   const router = useRouter();
   const [loginData, setLoginData] = useState({ email: "", password: "" });
   const [registerData, setRegisterData] = useState({ email: "", password: "", displayName: "" });
   const [isLogin, setIsLogin] = useState(true);
   const [isLoading, setIsLoading] = useState(false);

   const startLoading = () => {
      setIsLoading(true);
   };

   const stopLoading = () => {
      setIsLoading(false);
   }

   const db = getFirestore(app);

   //Registration
   const handleRegister = async () => {
      try {
         const userCredential = await createUserWithEmailAndPassword(
            auth,
            registerData.email,
            registerData.password
         );
         const user = userCredential.user;

         await addUserDataToFirestore(
            user.uid,
            registerData.displayName,
            registerData.email
         ).then(() => {
            sendEmailVerificationToUser(user.email);
         });
         
         await user.reload();
         if(user.emailVerified){
            router.push("/chats");
         }

      } catch (error) {
         console.error(error);
      } finally {
         stopLoading();
      }
   };

   //Login
   const handleLogin = async () => {
      try {
         startLoading();
         const userCredential = await signInWithEmailAndPassword(
            auth,
            loginData.email,
            loginData.password
         );

         const user = userCredential.user;

         if (user.emailVerified) {
            router.push("/chats");
         } else {
            toast.error(
               "Oh no, your email is not verified yet. Please check your email."
            );
         }
      } catch (error) {
         console.error(error);
      } finally {
         stopLoading();
      }
   };

   //Google Login
   const handleGoogleLogin = async () => {
      try {
         startLoading();
         const auth = getAuth();
         const provider = new GoogleAuthProvider();
         const userCredential = await signInWithPopup(auth, provider);

         const user = userCredential.user;

         await addUserDataToFirestore(
            user.uid,
            user.displayName,
            user.email,
         ).then(() => {
            router.push("/chats");
            toast.success('Successfully signed in with Google');
         });

      } catch (error) {
         console.error(error);
      } finally {
         stopLoading();
      }
   };

   //Add User Details to Firestore
   const addUserDataToFirestore = async (
      uid: string,
      displayName: string | null,
      email: string | null
   ) => {
      await setDoc(doc(collection(db, "users"), uid), {
         uid,
         displayName,
         email,
      });
   };

   //Send Verification Email to User Email
   const sendEmailVerificationToUser = async (_user: String | null) => {
      try {
         startLoading();
         await sendEmailVerification(auth.currentUser!).then(() => {
            toast.info("Email verification has been sent to your email.");
         });
      } catch (error) {
         console.error(error);
      } finally {
         stopLoading();
      }
   };

   const handleToggle = () => {
      setIsLogin(!isLogin);
   };

   return (
      <div className={styles.container}>
         {isLoading && (
            <div className={styles.overlay}>
               <div className={styles.spinner}></div>
            </div>
         )}
         <div className={styles.header}>
            <h3>Welcome to</h3>
            <h1>Haven</h1>
            <h2>A safe space to chat.</h2>
         </div>
         <div className={styles.formContainer}>
            <div className={styles.titleContainer}>
               <h1 className={styles.title}>
                  {isLogin ? "Log in" : "Register"}
               </h1>
            </div>
            <form className={styles.form}>
               <label className={styles.formLabel}>
                  Email:
                  <input
                     type="text"
                     value={isLogin ? loginData.email : registerData.email}
                     onChange={(e) =>
                        isLogin
                           ? setLoginData({
                              ...loginData,
                              email: e.target.value,
                           })
                           : setRegisterData({
                              ...registerData,
                              email: e.target.value,
                           })
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
                           ? setLoginData({
                              ...loginData,
                              password: e.target.value,
                           })
                           : setRegisterData({
                              ...registerData,
                              password: e.target.value,
                           })
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
                              setRegisterData({
                                 ...registerData,
                                 displayName: e.target.value,
                              })
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
                  disabled={isLoading}>
                  {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
               </button>
            </form>
            <p className={styles.toggleText} onClick={handleToggle}>
               {isLogin
                  ? "Don't have an account? Register here."
                  : "Already have an account? Login here."}
            </p>
            <div className="horizontalLine"></div>
            <button
               type="button"
               onClick={handleGoogleLogin}
               className={styles.formButton}>
               <Image
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='48px' height='48px'%3E%3Cpath fill='%23FFC107' d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'/%3E%3Cpath fill='%23FF3D00' d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'/%3E%3Cpath fill='%234CAF50' d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'/%3E%3Cpath fill='%231976D2' d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'/%3E%3C/svg%3E"
                  width={40}
                  height={40}
                  alt="Google Logo"
               />
               <p>Login with Google</p>
            </button>
         </div>
         <ToastContainer position="top-center" theme="dark" />

      </div>
   );
}