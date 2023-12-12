// [id].tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getDoc, doc, getFirestore, onSnapshot, collection, addDoc, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, app } from '../../../firebase/clientApp';

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

export default function ChatRoom({
  params,
}: {
  params: {
    chatroomID: string;
  };
}) {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { chatroomID } = params;

  useEffect(() => {
    if (!chatroomID) {
      return;
    }

    const chatRoomDocRef = doc(collection(db, 'chat_rooms'), chatroomID);
    const messagesCollectionRef = collection(chatRoomDocRef, 'messages');

    const unsubscribe = onSnapshot(
      query(messagesCollectionRef, orderBy('timestamp')),
      (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data() as MessageData,
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [chatroomID]);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('User Object:', user);
      setUser(user);
    });

    return authUnsubscribe;
  }, []);

  //Handle Sending of Messages
  const sendMessage = async () => {
    if (!user || !chatroomID) {
      return;
    }

    const chatRoomDocRef = doc(db, 'chat_rooms', chatroomID);
    const messagesCollectionRef = collection(chatRoomDocRef, 'messages');

    // Ensure that the user object has the displayName property
    const userName = user.displayName || 'Anonymous';

    // Retrieve the user's displayName from the database
    const userDisplayName = await getUserDisplayName(user.uid);

    await addDoc(messagesCollectionRef, {
      uid: user?.uid || '',
      // photoURL: user?.photoURL || '',
      displayName: userDisplayName,
      text: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  //Get User Display Names
  const getUserDisplayName = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);

    try {
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const { displayName } = docSnapshot.data();
        console.log('User DisplayName:', displayName);
        return displayName;
      } else {
        console.log('User not found');
        return null;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  //HandleGoBack
  const handleGoBack = () => {
    router.back();
  }

  // HandleLogout
  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/');
  };

  return (
    <div className="App">
      <div className="flex justify-center bg-gray-800 py-10 min-h-screen">
      <button className="mb-8 bg-white rounded-[10px] p-3" onClick={handleGoBack}>
          Go Back To Chat List
        </button>
        {user ? (
          <div>
            <div> Logged in as {user.email}</div>
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
            <button
              className="bg-white rounded-[10px] hover:bg-blue-400 p-3"
              onClick={sendMessage}
            >
              Send Message
            </button>
            <button className="mb-8 bg-white rounded-[10px] p-3" onClick={handleLogout}>
              Logout
            </button>

            <div className="flex flex-col gap-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message flex ${msg.data.uid === user.uid ? 'justify-end' : 'justify-start  '
                    }`}
                >
                  <div
                    className={`message flex flex-row p-3 gap-3 rounded-[20px] items-center ${msg.data.uid === user.uid ? ' text-white bg-blue-500' : ' bg-white '
                      }`}
                  >
                    <Image src={msg.data.photoURL} width={50} height={50} alt="(Photo)" />
                    <strong>{msg.data.displayName}: </strong>
                    {msg.data.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Login to view messages</p>
        )}
      </div>
    </div>
  );
}