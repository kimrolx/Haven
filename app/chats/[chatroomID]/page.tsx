// [id].tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
import {
   getDoc,
   doc,
   getFirestore,
   onSnapshot,
   collection,
   addDoc,
   orderBy,
   query,
   serverTimestamp,
   Timestamp,
} from "firebase/firestore";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, app } from "../../../firebase/clientApp";

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
   const [newMessage, setNewMessage] = useState("");
   const [loading, setLoading] = useState(true);

   const router = useRouter();
   const { chatroomID } = params;

   useEffect(() => {
      if (!chatroomID) {
         return;
      }

      const chatRoomDocRef = doc(collection(db, "chat_rooms"), chatroomID);
      const messagesCollectionRef = collection(chatRoomDocRef, "messages");

      const unsubscribe = onSnapshot(
         query(messagesCollectionRef, orderBy("timestamp")),
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
            console.error("Error fetching messages:", error);
            setLoading(false);
         }
      );

      return unsubscribe;
   }, [chatroomID]);

   useEffect(() => {
      const authUnsubscribe = onAuthStateChanged(auth, (user) => {
         console.log("User Object:", user);
         setUser(user);
      });

      return authUnsubscribe;
   }, []);

   //Handle Sending of Messages
   const sendMessage = async () => {
      if (!user || !chatroomID) {
         return;
      }

      const chatRoomDocRef = doc(db, "chat_rooms", chatroomID);
      const messagesCollectionRef = collection(chatRoomDocRef, "messages");

      // Ensure that the user object has the displayName property
      const userName = user.displayName || "Anonymous";

      // Retrieve the user's displayName from the database
      const userDisplayName = await getUserDisplayName(user.uid);

      await addDoc(messagesCollectionRef, {
         uid: user?.uid || "",
         // photoURL: user?.photoURL || '',
         displayName: userDisplayName,
         text: newMessage,
         timestamp: serverTimestamp(),
      });

      setNewMessage("");
   };

   //Get User Display Names
   const getUserDisplayName = async (uid: string) => {
      const userDocRef = doc(db, "users", uid);

      try {
         const docSnapshot = await getDoc(userDocRef);

         if (docSnapshot.exists()) {
            const { displayName } = docSnapshot.data();
            console.log("User DisplayName:", displayName);
            return displayName;
         } else {
            console.log("User not found");
            return null;
         }
      } catch (error) {
         console.error("Error getting user data:", error);
         return null;
      }
   };

   //HandleGoBack
   const handleGoBack = () => {
      router.back();
   };

   // HandleLogout
   const handleLogout = async () => {
      await auth.signOut();
      router.replace("/");
   };

   return (
      <div className={styles.container}>
         <button className={styles.button} onClick={handleGoBack}>
            Go Back To Chat List
         </button>
         {user ? (
            <div className={styles.container}>
               <div className={styles.header}>Chat Room</div>
               <div className={styles.userInfo}>Logged in as {user.email}</div>
               <div className={styles.messageInputContainer}>
                  <input
                     className={styles.messageInput}
                     value={newMessage}
                     onChange={(e) => setNewMessage(e.target.value)}
                     placeholder="Type your message..."
                  />
                  <button
                     className={styles.sendMessageButton}
                     onClick={sendMessage}>
                     Send
                  </button>
               </div>
               <div className={styles.messages}>
                  {messages.map((msg) => (
                     <div
                        key={msg.id}
                        className={`${styles.message} ${
                           msg.data.uid === user.uid
                              ? styles.sentMessage
                              : styles.receivedMessage
                        }`}>
                        {msg.data.photoURL && (
                           <Image
                              src={msg.data.photoURL}
                              width={50}
                              height={50}
                              alt="(Photo)"
                           />
                        )}
                        <strong>{msg.data.displayName}: </strong>
                        {msg.data.text}
                     </div>
                  ))}
               </div>
               <button className={styles.logoutButton} onClick={handleLogout}>
                  Logout
               </button>
            </div>
         ) : (
            <p>Login to view messages</p>
         )}
      </div>
   );
}
