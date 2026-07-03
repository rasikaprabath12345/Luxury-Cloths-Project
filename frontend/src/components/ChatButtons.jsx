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

  if (!settings) {
    return null;
  }

  // Format WhatsApp number to standard international format (without leading zeroes, spaces, +, etc.)
  const formatWhatsAppNumber = (num) => {
    if (!num) return "";
    let cleaned = num.replace(/\D/g, ''); // Remove non-numeric characters
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.slice(2);
    }
    // If local Sri Lankan format (starts with 0 and is 10 digits), prepend country code '94'
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '94' + cleaned.slice(1);
    }
    // If it starts with 7 (e.g. 70, 71, 75, 76, 77, 78) and is 9 digits, prepend country code '94'
    else if (cleaned.length === 9 && /^[7][01245678]/.test(cleaned)) {
      cleaned = '94' + cleaned;
    }
    return cleaned;
  };

  const rawWhatsApp = settings.whatsApp;
  const rawMessenger = settings.messenger;

  // Check if configuration exists and is not a default placeholder
  const hasWhatsApp = rawWhatsApp && rawWhatsApp.trim() !== "" && !rawWhatsApp.includes("X");
  const hasMessenger = rawMessenger && rawMessenger.trim() !== "" && rawMessenger !== "your_page_username";

  if (!hasWhatsApp && !hasMessenger) {
    return null;
  }

  const formattedWhatsApp = hasWhatsApp ? formatWhatsAppNumber(rawWhatsApp) : "";

  return (
    <div className="chat-container">
      {/* WhatsApp Link */}
      {hasWhatsApp && (
        <a href={`https://wa.me/${formattedWhatsApp}`} target="_blank" rel="noopener noreferrer" className="chat-btn whatsapp">
          <FaWhatsapp />
        </a>
      )}
      
      {/* Messenger Link */}
      {hasMessenger && (
        <a href={`https://m.me/${rawMessenger}`} target="_blank" rel="noopener noreferrer" className="chat-btn messenger">
          <FaFacebookMessenger />
        </a>
      )}
    </div>
  );
};

export default ChatButtons;