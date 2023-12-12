// chats.tsx
"use client";
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { getFirestore, onSnapshot, collection, Timestamp } from "firebase/firestore";
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, app } from "../../firebase/clientApp";

const db = getFirestore(app);

interface MessageData {
  uid: string;
  photoURL: string;
  displayName: string;
  text: string;
  timestamp: Timestamp;
}

interface Message {
  id: string;
  data: MessageData;
}

interface UserData {
  uid: string;
  displayName: string;
}

export default function Chats() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Use the useRouter hook to get the router instance
  const router = useRouter();

  // Modify handleSelectUser to navigate to dynamic route
  const handleSelectUser = (selectedUser: User) => {
    const sortedUserIds = [selectedUser.uid, user?.uid].sort();
    const chatroomID = `${sortedUserIds[0]}_${sortedUserIds[1]}`;
    router.push(`/chats/${chatroomID}`);
  };


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const unsubscribeFirestore = onSnapshot(collection(db, 'users'), (snapshot) => {
      console.log('Snapshot received:', snapshot.docs);

      const usersData = snapshot.docs
        .map((doc) => ({
          uid: doc.id,
          displayName: doc.data().displayName || '',
        }))
        .filter((u) => u.uid !== user?.uid);

      console.log('Users data:', usersData);
      setUsers(usersData as User[]);
    }, (error) => {
      console.error('Error fetching users:', error);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, [user]);


  return (
    <div className="user-list">
      {users
        .filter((u) => user && u.uid !== user.uid)
        .map((u) => (
          <div key={u.uid} onClick={() => handleSelectUser(u)}>
            {u.displayName}
          </div>
        ))}
    </div>
  );

}