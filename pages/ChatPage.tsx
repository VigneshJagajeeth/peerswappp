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
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + (error.message || 'Unknown error. Check rules.'));
    }
  };

  return (
    <div className="bg-white dark:bg-[#0B0B1A] h-full flex flex-col relative w-full overflow-hidden">
        
        {/* Sticky Header */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm p-3 flex items-center justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm border-2 border-white dark:border-gray-800">
              {otherUserName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white leading-tight">{otherUserName}</h2>
              <p className="text-xs text-green-500 font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-4 sm:p-6 overflow-y-auto flex flex-col space-y-5" style={{ backgroundImage: "radial-gradient(circle, rgba(99, 102, 241, 0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
          {messages.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 my-10">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <p className="font-medium text-gray-500 dark:text-gray-400">Start the conversation with {otherUserName}!</p>
              <p className="text-sm mt-1">Say hello and figure out the details.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.senderId === currentUser.uid;
              const isLast = index === messages.length - 1;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] sm:max-w-[75%] px-4 sm:px-5 py-2.5 sm:py-3 relative shadow-sm ${
                      isMe 
                        ? 'bg-gradient-to-br from-primary to-indigo-600 text-white rounded-3xl rounded-br-sm' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-3xl rounded-bl-sm border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <p className="leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{msg.text}</p>
                    <div className={`text-[10px] sm:text-xs mt-1.5 flex items-center justify-end ${isMe ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 ml-1">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.815a.75.75 0 011.05-.145z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 z-20">
          <form onSubmit={handleSendMessage} className="flex space-x-2 relative items-end">
            <div className="flex-grow relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message..."
                className="block w-full border border-gray-300 dark:border-gray-700 rounded-full py-2.5 pl-4 pr-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-all text-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-primary text-white rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-transform active:scale-95 shadow-md group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </div>
    </div>
  );
};

export default ChatPage;
