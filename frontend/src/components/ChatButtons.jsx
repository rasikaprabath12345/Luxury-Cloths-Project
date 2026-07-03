"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FaWhatsapp, FaFacebookMessenger } from 'react-icons/fa';
import { settingsAPI } from '@/lib/api';
import './ChatButtons.css'; // CSS ගොනුව import කරන්න

const ChatButtons = () => {
  const pathname = usePathname();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.getSettings();
        if (response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error("Failed to load chat buttons settings", err);
      }
    };
    fetchSettings();
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const whatsappNum = settings?.whatsApp || "947XXXXXXXXXX";
  const messengerUser = settings?.messenger || "your_page_username";

  return (
    <div className="chat-container">
      {/* WhatsApp Link */}
      <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noopener noreferrer" className="chat-btn whatsapp">
        <FaWhatsapp />
      </a>
      
      {/* Messenger Link */}
      <a href={`https://m.me/${messengerUser}`} target="_blank" rel="noopener noreferrer" className="chat-btn messenger">
        <FaFacebookMessenger />
      </a>
    </div>
  );
};

export default ChatButtons;