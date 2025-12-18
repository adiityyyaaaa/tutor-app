import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import socketService from '../services/socket';
import { messagesAPI } from '../services/api';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const ChatPage = () => {
    const { user } = useAuth();
    const { startCall } = useCall();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Connect socket on mount
    useEffect(() => {
        if (user) {
            socketService.connect(user._id);

            // Listen for online users
            socketService.onUserOnline((userId) => {
                setOnlineUsers(prev => [...prev, userId]);
            });

            socketService.onUserOffline((userId) => {
                setOnlineUsers(prev => prev.filter(id => id !== userId));
            });

            // Listen for incoming messages
            socketService.onReceiveMessage((message) => {
                console.log('Received message:', message);

                // If message is from currently selected user, append to messages
                if (selectedUser && (message.senderId === selectedUser._id || message.senderId._id === selectedUser._id)) {
                    setMessages(prev => [...prev, message]);
                    // Mark as read immediately
                    messagesAPI.markAsRead(message._id);
                    // Also emit read receipt socket event if needed (backend handles markAsRead API)
                }

                // Update conversations list (move to top, update last message, increment unread)
                updateConversationList(message);
            });

            // Listen for typing
            socketService.onTyping(({ senderId }) => {
                if (selectedUser && senderId === selectedUser._id) {
                    setIsTyping(true);
                }
            });

            socketService.onStopTyping(({ senderId }) => {
                if (selectedUser && senderId === selectedUser._id) {
                    setIsTyping(false);
                }
            });

            return () => {
                socketService.disconnect();
            };
        }
    }, [user, selectedUser]); // Re-bind listeners if selectedUser changes? No, closure issue.

    // Better way to handle socket listeners with closure state (selectedUser):
    // Use a ref for selectedUser or functional state updates.
    // For simplicity, the above dependency [user, selectedUser] causes reconnects/rebinds which is okay but not optimal. 
    // Optimization: separate useEffect for socket connection vs listeners, or use refs.
    // Let's use functional updates or Refs for selectedUser check inside listener.
    const selectedUserRef = useRef(selectedUser);
    useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

    useEffect(() => {
        if (!user) return;

        // Fetch initial conversations
        const fetchConversations = async () => {
            try {
                const response = await messagesAPI.getConversations();
                if (response.data.success) {
                    setConversations(response.data.conversations);
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    const updateConversationList = (message) => {
        setConversations(prev => {
            const senderId = message.senderId._id || message.senderId;
            const receiverId = message.receiverId._id || message.receiverId;
            const otherId = senderId === user._id ? receiverId : senderId;

            // Check if conversation exists
            const existingIndex = prev.findIndex(c => c.user._id === otherId);

            let newConversations = [...prev];
            let newConv;

            if (existingIndex > -1) {
                // Update existing
                newConv = {
                    ...newConversations[existingIndex],
                    lastMessage: message,
                    unreadCount: (senderId !== user._id && selectedUserRef.current?._id !== senderId)
                        ? newConversations[existingIndex].unreadCount + 1
                        : newConversations[existingIndex].unreadCount
                };
                newConversations.splice(existingIndex, 1);
            } else {
                // New conversation (this is tricky without full user details of sender)
                // If it's a new message from someone we don't have in list, we need their details.
                // message.senderId usually populated.
                if (message.senderId && typeof message.senderId === 'object') {
                    newConv = {
                        user: message.senderId,
                        lastMessage: message,
                        unreadCount: 1
                    };
                }
            }

            if (newConv) {
                newConversations.unshift(newConv);
            }
            return newConversations;
        });
    };

    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        setIsTyping(false);
        try {
            // Fetch messages
            const response = await messagesAPI.getConversation(user._id);
            if (response.data.success) {
                setMessages(response.data.messages);
                // Mark all as read
                await messagesAPI.markAllAsRead(user._id);
                // Update conversation unread count locally
                setConversations(prev => prev.map(c =>
                    c.user._id === user._id ? { ...c, unreadCount: 0 } : c
                ));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (text) => {
        if (!selectedUser) return;

        try {
            const response = await messagesAPI.send({
                receiverId: selectedUser._id,
                receiverType: selectedUser.role === 'student' ? 'User' : 'Teacher',
                message: text,
                messageType: 'text'
            });

            if (response.data.success) {
                const newMsg = response.data.data;
                setMessages(prev => [...prev, newMsg]);
                updateConversationList(newMsg);
                socketService.sendMessage(newMsg); // Emit to socket for real-time delivery
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleCreateCall = () => {
        if (selectedUser) {
            startCall(selectedUser);
        }
    };

    const handleTyping = () => {
        if (selectedUser) {
            socketService.sendTyping(selectedUser._id);
            // Stop typing after delay
            setTimeout(() => {
                socketService.stopTyping(selectedUser._id);
            }, 3000);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container-custom py-3">
                    <div className="flex items-center justify-between">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <BookOpen className="w-6 h-6 text-primary" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">HomeTutor Chat</span>
                        </Link>
                        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-primary">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="flex-1 container-custom py-4 h-[calc(100vh-64px)] overflow-hidden">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex h-full overflow-hidden">
                    {/* Sidebar */}
                    <div className={`w-full md:w-1/3 lg:w-1/4 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                        <ConversationList
                            conversations={conversations}
                            selectedUser={selectedUser}
                            onSelectUser={handleSelectUser}
                            onlineUsers={onlineUsers}
                        />
                    </div>

                    {/* Chat Window */}
                    <div className={`w-full md:w-2/3 lg:w-3/4 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                        <ChatWindow
                            selectedUser={selectedUser}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            isTyping={isTyping}
                            onType={handleTyping}
                            onCall={handleCreateCall}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
