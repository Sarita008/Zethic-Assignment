import { useState, useEffect, useCallback } from 'react';
import chatService from '../services/chatService';
import storageManager from '../utils/storage';

export const useChat = (userId, websiteId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Load cached chat history on mount
  useEffect(() => {
    if (userId && websiteId) {
      const cachedHistory = storageManager.getChatHistory(userId, websiteId);
      if (cachedHistory) {
        setMessages(cachedHistory);
      } else {
        loadChatHistory();
      }
    }
  }, [userId, websiteId]);

  const loadChatHistory = useCallback(async (pageNum = 1, append = false) => {
    if (!userId || !websiteId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getChatHistory(userId, websiteId, pageNum, 20);
      const newMessages = response.chats || [];

      if (append) {
        setMessages(prev => [...prev, ...newMessages]);
      } else {
        setMessages(newMessages);
        // Cache the first page
        if (pageNum === 1) {
          storageManager.setChatHistory(userId, websiteId, newMessages);
        }
      }

      setHasMore(response.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, websiteId]);

  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading) {
      loadChatHistory(page + 1, true);
    }
  }, [hasMore, loading, page, loadChatHistory]);

  const sendMessage = useCallback(async (question) => {
    if (!userId || !websiteId || !question.trim()) return;

    setSending(true);
    setError(null);

    // Optimistically add user message
    const userMessage = {
      _id: Date.now().toString(),
      question,
      answer: '',
      userId,
      websiteId,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages(prev => [userMessage, ...prev]);

    try {
      const response = await chatService.sendMessage(userId, websiteId, question);
      
      // Replace optimistic message with real response
      setMessages(prev => prev.map(msg => 
        msg._id === userMessage._id 
          ? { ...response, _id: response.chatId }
          : msg
      ));

      // Update cache
      const updatedMessages = messages.map(msg => 
        msg._id === userMessage._id 
          ? { ...response, _id: response.chatId }
          : msg
      );
      storageManager.setChatHistory(userId, websiteId, updatedMessages.slice(0, 20));

      return response;
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== userMessage._id));
      setError(err.message);
      throw err;
    } finally {
      setSending(false);
    }
  }, [userId, websiteId, messages]);

  const deleteMessage = useCallback(async (chatId) => {
    if (!userId) return;

    try {
      await chatService.deleteChat(chatId, userId);
      
      setMessages(prev => prev.filter(msg => msg._id !== chatId));
      
      // Update cache
      const updatedMessages = messages.filter(msg => msg._id !== chatId);
      storageManager.setChatHistory(userId, websiteId, updatedMessages.slice(0, 20));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userId, websiteId, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    if (userId && websiteId) {
      storageManager.clearChatHistory(userId, websiteId);
    }
  }, [userId, websiteId]);

  const refreshMessages = useCallback(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    loadChatHistory(1, false);
  }, [loadChatHistory]);

  return {
    messages,
    loading,
    sending,
    error,
    hasMore,
    sendMessage,
    loadMoreMessages,
    deleteMessage,
    clearMessages,
    refreshMessages,
  };
};