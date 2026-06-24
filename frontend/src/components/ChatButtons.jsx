import { FaWhatsapp, FaFacebookMessenger } from 'react-icons/fa';
import './ChatButtons.css'; // CSS ගොනුව import කරන්න

const ChatButtons = () => {
  return (
    <div className="chat-container">
      {/* WhatsApp Link */}
      <a href="https://wa.me/947XXXXXXXXXX" target="_blank" rel="noopener noreferrer" className="chat-btn whatsapp">
        <FaWhatsapp />
      </a>
      
      {/* Messenger Link */}
      <a href="https://m.me/your_page_username" target="_blank" rel="noopener noreferrer" className="chat-btn messenger">
        <FaFacebookMessenger />
      </a>
    </div>
  );
};

export default ChatButtons;