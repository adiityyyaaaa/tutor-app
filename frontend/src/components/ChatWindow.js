import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, MoreVertical } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { getInitials, stringToColor } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const ChatWindow = ({
    selectedUser,
    messages,
    onSendMessage,
    isTyping,
    onType,
    onCall
}) => {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        onSendMessage(newMessage);
        setNewMessage('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
        onType();
    };

    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-gray-500">
                    <p className="text-xl font-semibold mb-2">Welcome to Messages</p>
                    <p>Select a conversation to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    {selectedUser.photo ? (
                        <img
                            src={selectedUser.photo}
                            alt={selectedUser.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: stringToColor(selectedUser.name) }}
                        >
                            {getInitials(selectedUser.name)}
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            {selectedUser.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                            {selectedUser.role}
                            {/* We could add online status here again if we want */}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onCall}
                        className="btn btn-ghost hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300"
                        title="Start Audio Call"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg._id || msg.tempId}
                        message={msg}
                        isOwn={msg.senderId._id === user._id || msg.senderId === user._id}
                    />
                ))}

                {isTyping && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg rounded-tl-none px-4 py-2 shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="input flex-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="btn btn-primary px-4"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
