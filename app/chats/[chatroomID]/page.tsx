// [id].tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
   Timestamp
} from "firebase/firestore";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, app } from "../../../firebase/clientApp";

const db = getFirestore(app);

interface MessageData {
   uid: string;
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
   const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

   const router = useRouter();
   const { chatroomID } = params;

   //Listener for changes to the messages collection
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
         },
         (error) => {
            console.error("Error fetching messages:", error);
         }
      );

      return unsubscribe;
   }, [chatroomID]);

   //Listener for changes in Auth State (Logged in or Signed out)
   useEffect(() => {
      const authUnsubscribe = onAuthStateChanged(auth, async (user) => {

         if (user) {
            setUser(user);

            const userDisplayName = await getUserDisplayName(user.uid);
            setUserDisplayName(userDisplayName);
         } else {
            setUser(null);
            setUserDisplayName(null);
         }
      });
      return authUnsubscribe;
   }, []);

   //Sending of Messages Handler
   const sendMessage = async () => {
      if (!user || !chatroomID) {
         return;
      }

      const chatRoomDocRef = doc(db, "chat_rooms", chatroomID);
      const messagesCollectionRef = collection(chatRoomDocRef, "messages");

      const userDisplayName = await getUserDisplayName(user.uid);

      await addDoc(messagesCollectionRef, {
         uid: user?.uid || "",
         displayName: userDisplayName,
         text: newMessage,
         timestamp: serverTimestamp(),
      });

      setNewMessage("");
   };

   //Get Display Name
   const getUserDisplayName = async (uid: string) => {
      const userDocRef = doc(db, "users", uid);

      try {
         const docSnapshot = await getDoc(userDocRef);

         if (docSnapshot.exists()) {
            const { displayName } = docSnapshot.data();
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
         {user ? (
            <div className={styles.flexContainer}>
                <div className={styles.header}>
                  Chat Room
               <div className={styles.userInfo}>
                  <button className={styles.backButton} onClick={handleGoBack}>
                     Go Back
                  </button>
                  <button className={styles.logoutButton} onClick={handleLogout}>
                     Logout
                  </button>
                   {/* {userDisplayName &&
                     (<p className={styles.userInfoName}>{userDisplayName}</p>
                  )}   */}
                  </div>
               </div>
               <div className={styles.messages}>
                  {messages.map((msg) => (
                     <div
                        key={msg.id}
                        className={`${styles.message} ${msg.data.uid === user.uid
                           ? styles.sentMessage
                           : styles.receivedMessage
                           }`}>
                        <strong>{msg.data.displayName}: </strong>
                        {msg.data.text}
                     </div>
                  ))}
               </div>
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
            </div>
         ) :
          (
            <p className={styles.p} >Login to view messages</p>
         )
         }
      </div>
   );
}
