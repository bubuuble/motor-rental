"use client";

import { useState } from "react";
import ChatModal from "@/components/ChatModal";

export default function FloatingChat() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300 hover:scale-110 transition-all flex items-center justify-center"
        title="Chat dengan Owner"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {showChat && <ChatModal onClose={() => setShowChat(false)} />}
    </>
  );
}
