"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = () => {
    //TODO handleLogin
    console.log('Logging in with:', loginData);
    router.push('/chats');
  };

  const handleRegister = () => {
    //TODO handleRegister
    console.log('Registering with:', registerData);
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  const formData = isLogin ? loginData : registerData;
  const setFormData = isLogin ? setLoginData : setRegisterData;

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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={styles.formInput}
            />
          </label>
          <br />
          <label className={styles.formLabel}>
            Password:
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={styles.formInput}
            />
          </label>
          <br />
          <button
            type="button"
            onClick={isLogin ? handleLogin : handleRegister}
            className={styles.formButton}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className={styles.toggleText} onClick={handleToggle}>
          {isLogin ? "Don't have an account? Register here." : 'Already have an account? Login here.'}
        </p>
      </div>
    </div>
  );
}
