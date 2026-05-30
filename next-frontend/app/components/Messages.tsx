"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { api } from "@/utils/api";

interface Message {
  _id: string; // MongoDB uses _id
  userId: any;
  subject: string;
  body: string;
  adminReply: string | null;
  status: string;
  createdAt: string;
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states for sending
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Admin reply states
  const [replyText, setReplyText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUserId(session.user.id);
      const role = session.user.user_metadata?.role || "buyer";
      setUserRole(role);
      const adminFlag = role === "admin";
      setIsAdmin(adminFlag);
      await fetchMessages();
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    try {
      const data = await api.get('/messages');
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return alert("Must be logged in.");

    try {
      await api.post('/messages', { subject, body });
      setSubject("");
      setBody("");
      fetchMessages();
      alert("Ticket submitted successfully!");
    } catch (error: any) {
      alert("Error sending message: " + error.message);
    }
  };

  const handleAdminReply = async (id: string) => {
    try {
      await api.patch(`/messages/${id}/reply`, { adminReply: replyText });
      setReplyText("");
      setReplyingToId(null);
      fetchMessages();
      alert("Reply sent successfully!");
    } catch (error: any) {
      alert("Error adding reply: " + error.message);
    }
  };

  if (!userId) {
    return <div className="p-4 text-center text-gray-500">Please log in to view Support Messages.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow border min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        {isAdmin ? "Express Customer Care" : "Support Center"}
      </h2>

      {/* User Submission Form */}
      {!isAdmin && (
         <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
           <h3 className="font-bold text-lg mb-4 text-blue-800">New Message</h3>
           <form onSubmit={handleSendMessage} className="space-y-4">
             <input
               type="text"
               placeholder="Subject"
               value={subject}
               onChange={(e) => setSubject(e.target.value)}
               required
               className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
             />
             <textarea
               placeholder="Describe your issue or ask a question..."
               value={body}
               onChange={(e) => setBody(e.target.value)}
               required
               rows={4}
               className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
             ></textarea>
             <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition">
               Submit Ticket
             </button>
           </form>
         </div>
      )}

      {/* Message List */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-gray-700">
          {isAdmin ? "All Support Tickets" : "Your Existing Tickets"}
        </h3>
        
        {loading ? (
           <p className="text-gray-500 py-4">Loading messages...</p>
        ) : messages.length === 0 ? (
           <p className="text-gray-500 py-4 italic">No messages found.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
               <div key={msg._id} className="border rounded-lg p-5 shadow-sm hover:shadow-md transition bg-gray-50">
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-gray-900 border-b pb-1 w-full flex justify-between">
                     <span>{msg.subject}</span>
                     <span className={`text-xs px-2 py-1 rounded font-bold uppercase ml-4 ${msg.status === 'resolved' ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>{msg.status}</span>
                   </h4>
                 </div>
                 
                 {isAdmin && (
                   <p className="text-xs text-gray-500 font-mono mb-2">
                     From: {msg.userId?.name || msg.userId}
                   </p>
                 )}
                 
                 <p className="text-gray-700 py-3">{msg.body}</p>
                 
                 {/* Reply Block */}
                 {msg.adminReply ? (
                   <div className="mt-4 bg-white p-4 border border-blue-200 rounded-md shadow-inner">
                     <p className="text-sm font-bold text-blue-700 mb-1">Admin Response:</p>
                     <p className="text-gray-800">{msg.adminReply}</p>
                   </div>
                 ) : (
                   isAdmin && (
                     <div className="mt-4 pt-4 border-t border-gray-200">
                       {replyingToId === msg._id ? (
                         <div className="space-y-2">
                           <textarea
                             value={replyText}
                             onChange={(e) => setReplyText(e.target.value)}
                             placeholder="Write your response to the user..."
                             className="w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                             rows={3}
                           />
                           <div className="flex gap-2">
                             <button onClick={() => handleAdminReply(msg._id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition">Send Reply</button>
                             <button onClick={() => { setReplyingToId(null); setReplyText(""); }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded text-sm transition">Cancel</button>
                           </div>
                         </div>
                       ) : (
                         <button onClick={() => setReplyingToId(msg._id)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline">Reply to this ticket</button>
                       )}
                     </div>
                   )
                 )}
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
