import React from 'react';
import { User, Bot } from 'lucide-react';
import PlantResult from './PlantResult';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      {!isUser && (
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-3xl ${isUser ? 'order-1' : 'order-2'}`}>
        <div className={`
          p-4 rounded-lg
          ${isUser 
            ? 'bg-primary-600 text-white ml-auto' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }
        `}>
          {message.type === 'text' && (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
          
          {message.type === 'image' && (
            <div className="space-y-2">
              <img 
                src={message.content} 
                alt="Uploaded plant" 
                className="max-w-full h-auto rounded-lg"
                style={{ maxHeight: '300px' }}
              />
              <p className="text-sm opacity-75">
                Plant image uploaded for identification
              </p>
            </div>
          )}
          
          {message.type === 'plant_result' && (
            <PlantResult data={message.content} />
          )}
        </div>
        
        <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 order-2">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

