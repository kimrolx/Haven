"use client";
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { getFirestore, onSnapshot, collection, addDoc, orderBy, query, serverTimestamp, Timestamp } from "firebase/firestore";
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

export default function Chats() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Use the useRouter hook to get the router instance
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data() as MessageData,
        }))
      );
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return authUnsubscribe;
  }, []);

  const sendMessage = async () => {
    await addDoc(collection(db, 'messages'), {
      uid: user?.uid,
      photoURL: user?.photoURL,
      displayName: user?.displayName,
      text: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  //HandleLogout
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <div className="App">
      <div className='flex justify-center bg-gray-800 py-10 min-h-screen' >
        {user ? (
          <div>
            <div> Logged in as {user.displayName}</div>
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
            <button className=' bg-white rounded-[10px] hover:bg-blue-400 p-3' onClick={sendMessage}>Send Message</button>
            <button className='mb-8 bg-white rounded-[10px] p-3' onClick={handleLogout}>Logout</button>

            <div className="flex flex-col gap-5">

              {messages.map(msg => (
                <div key={msg.id} className={`message flex ${msg.data.uid === user.uid ? 'justify-end' : 'justify-start  '}`}>
                  <div className={`message flex flex-row p-3 gap-3 rounded-[20px] items-center ${msg.data.uid === user.uid ? ' text-white bg-blue-500' : ' bg-white '}`}>
                    <Image
                      src={msg.data.photoURL}
                      width={50}
                      height={50}
                      alt="(Photo)" />
                    {msg.data.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) :

          (
            <p>Login to view messages</p>
          )}

      </div>
    </div>
  );
}