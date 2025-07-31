import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatAPI, handleAPIError } from '../utils/api';

const ChatContext = createContext();

const initialState = {
  chats: [],
  currentChatId: null,
  messages: [],
  loading: false,
  error: null,
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CHATS':
      return { ...state, chats: action.payload, loading: false };
    
    case 'ADD_CHAT':
      return { 
        ...state, 
        chats: [action.payload, ...state.chats],
        loading: false 
      };
    
    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.id ? action.payload : chat
        ),
        loading: false
      };
    
    case 'DELETE_CHAT':
      const newChats = state.chats.filter(chat => chat.id !== action.payload);
      return {
        ...state,
        chats: newChats,
        currentChatId: state.currentChatId === action.payload ? null : state.currentChatId,
        messages: state.currentChatId === action.payload ? [] : state.messages,
        loading: false
      };
    
    case 'SET_CURRENT_CHAT':
      return { 
        ...state, 
        currentChatId: action.payload,
        messages: [],
        loading: false 
      };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload, loading: false };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        loading: false
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Load messages when current chat changes
  useEffect(() => {
    if (state.currentChatId) {
      loadMessages(state.currentChatId);
    }
  }, [state.currentChatId]);

  const loadChats = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const chats = await chatAPI.getChats();
      dispatch({ type: 'SET_CHATS', payload: chats });
    } catch (error) {
      const errorInfo = handleAPIError(error);
      dispatch({ type: 'SET_ERROR', payload: errorInfo.message });
    }
  };

  const createChat = async (title = 'New Plant Recognition') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newChat = await chatAPI.createChat(title);
      dispatch({ type: 'ADD_CHAT', payload: newChat });
      dispatch({ type: 'SET_CURRENT_CHAT', payload: newChat.id });
      return newChat;
    } catch (error) {
      const errorInfo = handleAPIError(error);
      dispatch({ type: 'SET_ERROR', payload: errorInfo.message });
      throw error;
    }
  };

  const updateChatTitle = async (chatId, title) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedChat = await chatAPI.updateChat(chatId, title);
      dispatch({ type: 'UPDATE_CHAT', payload: updatedChat });
    } catch (error) {
      const errorInfo = handleAPIError(error);
      dispatch({ type: 'SET_ERROR', payload: errorInfo.message });
    }
  };

  const deleteChat = async (chatId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await chatAPI.deleteChat(chatId);
      dispatch({ type: 'DELETE_CHAT', payload: chatId });
    } catch (error) {
      const errorInfo = handleAPIError(error);
      dispatch({ type: 'SET_ERROR', payload: errorInfo.message });
    }
  };

  const selectChat = async (chatId) => {
    try {
      dispatch({ type: 'SET_CURRENT_CHAT', payload: chatId });
    } catch (error) {
      const errorInfo = handleAPIError(error);
      dispatch({ type: 'SET_ERROR', payload: errorInfo.message });
    }
  };

  const loadMessages = async (chatId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const messages = await chatAPI.getMessages(chatId);
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (error) {
      const errorInfo = handleAPIError(error);
      dispatch({ type: 'SET_ERROR', payload: errorInfo.message });
    }
  };

  const addMessage = async (chatId, message) => {
    try {
      const newMessage = await chatAPI.addMessage(chatId, message);
      dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
      
      // Update chat's updated_at timestamp in the chats list
      const updatedChats = state.chats.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, updated_at: new Date().toISOString() };
        }
        return chat;
      });
      dispatch({ type: 'SET_CHATS', payload: updatedChats });
      
      return newMessage;
    } catch (error) {
      const errorInfo = handleAPIError(error);
      dispatch({ type: 'SET_ERROR', payload: errorInfo.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    loadChats,
    createChat,
    updateChatTitle,
    deleteChat,
    selectChat,
    loadMessages,
    addMessage,
    clearError,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

