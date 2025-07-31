import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Loader2 } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import PlantResult from './PlantResult';

const ChatInterface = ({ onUploadClick }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { 
    currentChatId, 
    messages, 
    loading, 
    addMessage, 
    createChat 
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      // Ensure we have a chat to add messages to
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = await createChat('Plant Chat');
        chatId = newChat.id;
      }

      // Add user message
      await addMessage(chatId, {
        sender: 'user',
        type: 'text',
        content: messageText
      });

      // Add assistant response (simple echo for now)
      const assistantResponse = generateAssistantResponse(messageText);
      await addMessage(chatId, {
        sender: 'assistant',
        type: 'text',
        content: assistantResponse
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore the message if sending failed
      setInputMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const generateAssistantResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help you identify plants. You can upload a photo of any plant, and I'll provide detailed information about it including its name, characteristics, benefits, and care instructions.";
    }
    
    if (lowerMessage.includes('help')) {
      return "I can help you identify plants from photos! Here's what I can do:\n\n• Identify plant species from images\n• Provide scientific and common names\n• Share information about plant benefits and potential risks\n• Give care instructions\n• Answer questions about plants\n\nJust click the 'Upload Image' button to get started!";
    }
    
    if (lowerMessage.includes('identify') || lowerMessage.includes('plant')) {
      return "To identify a plant, please upload a clear photo using the 'Upload Image' button. Make sure the plant is well-lit and the key features (leaves, flowers, stems) are visible for the best identification results.";
    }
    
    if (lowerMessage.includes('care') || lowerMessage.includes('water') || lowerMessage.includes('light')) {
      return "Plant care varies greatly between species. Once you upload a photo and I identify your plant, I can provide specific care instructions including watering, lighting, soil, and temperature requirements.";
    }
    
    return "I'm a plant identification assistant! Upload a photo of any plant, and I'll help you identify it and provide detailed information. You can also ask me questions about plant care, benefits, or general plant-related topics.";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message) => {
    if (message.type === 'plant_result') {
      return (
        <PlantResult 
          key={message.id}
          data={message.content}
          timestamp={message.timestamp}
        />
      );
    } else if (message.type === 'image') {
      return (
        <MessageBubble
          key={message.id}
          message={{
            ...message,
            content: (
              <div className="max-w-sm">
                <img 
                  src={message.content} 
                  alt="Uploaded plant" 
                  className="rounded-lg max-w-full h-auto"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Analyzing plant image...
                </p>
              </div>
            )
          }}
        />
      );
    } else {
      return (
        <MessageBubble
          key={message.id}
          message={message}
        />
      );
    }
  };

  if (!currentChatId && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to PlantID
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Upload a photo of any plant and I'll help you identify it with detailed information about its characteristics, benefits, and care instructions.
          </p>
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload size={20} />
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about plants..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={sending}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

