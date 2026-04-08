import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, ChatMessage } from '../types';

interface ChatPageProps {
  currentUser: UserProfile;
  otherUserId: string;
  otherUserName: string;
  onBack: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUser, otherUserId, otherUserName, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We need to fetch messages where either:
    // (senderId == currentUser.uid AND receiverId == otherUserId) OR (senderId == otherUserId AND receiverId == currentUser.uid)
    // Firestore doesn't support OR queries easily across different fields without composite indexes, 
    // so we can use a combined threadId: e.g., "uid1_uid2" sorted alphabetically.
    
    const threadId = [currentUser.uid, otherUserId].sort().join('_');
    
    const q = query(
      collection(db, 'chats', threadId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [currentUser.uid, otherUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const threadId = [currentUser.uid, otherUserId].sort().join('_');
    
    try {
      await addDoc(collection(db, 'chats', threadId, 'messages'), {
        senderId: currentUser.uid,
        text: newMessage.trim(),
        createdAt: new Date().toISOString()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center">
        <button onClick={onBack} className="text-primary hover:underline font-semibold mr-4">
          &larr; Back
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Chat with {otherUserName}</h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto flex flex-col space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMe 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-primary-100 opacity-80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 shadow-md border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
