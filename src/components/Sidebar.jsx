import React, { useState } from 'react';
import { Plus, MessageSquare, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { 
    chats, 
    currentChatId, 
    loading, 
    error, 
    createChat, 
    selectChat, 
    updateChatTitle, 
    deleteChat,
    clearError 
  } = useChat();
  
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleNewChat = async () => {
    try {
      await createChat();
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleChatSelect = (chatId) => {
    selectChat(chatId);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleEditStart = (chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = async () => {
    if (editTitle.trim() && editingChatId) {
      try {
        await updateChatTitle(editingChatId, editTitle.trim());
        setEditingChatId(null);
        setEditTitle('');
      } catch (error) {
        console.error('Failed to update chat title:', error);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleDelete = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(chatId);
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Plant Chats
            </h2>
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={handleNewChat}
              disabled={loading}
              className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
              New Chat
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              <div className="flex justify-between items-start">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading && chats.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="mx-auto mb-2" size={32} />
                <p>No chats yet</p>
                <p className="text-sm">Create a new chat to get started</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                      currentChatId === chat.id
                        ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => !editingChatId && handleChatSelect(chat.id)}
                  >
                    {editingChatId === chat.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleEditSave}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {chat.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(chat.updated_at)} • {chat.message_count || 0} messages
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStart(chat);
                              }}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(chat.id);
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

