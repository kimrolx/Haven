// chats.tsx
"use client";
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

import { getFirestore, onSnapshot, collection } from "firebase/firestore";
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, app } from "../../firebase/clientApp";

const db = getFirestore(app);

export default function Chats() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const unsubscribeFirestore = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs
        .map((doc) => ({
          uid: doc.id,
          displayName: doc.data().displayName || '',
        }))
        .filter((u) => u.uid !== user?.uid);

        const verifiedUsers = usersData.filter((u) => {
        const authUser = auth.currentUser;
        return authUser && authUser.emailVerified;
      });

      setUsers(verifiedUsers as User[]);
    }, (error) => {
      console.error('Error fetching users:', error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, [user]);

  //Navigate to Dynamic Route
  const handleSelectUser = (selectedUser: User) => {
    const sortedUserIds = [selectedUser.uid, user?.uid].sort();
    const chatroomID = `${sortedUserIds[0]}_${sortedUserIds[1]}`;
    router.push(`/chats/${chatroomID}`);
  };

  return (
    <div className={styles.userList}>
      <h1>List of Verified Users</h1>
      {users.map((u) => (
        <div className={styles.userItem} key={u.uid} onClick={() => handleSelectUser(u)}>
          {u.displayName}
        </div>
      ))}
    </div>
  );
}