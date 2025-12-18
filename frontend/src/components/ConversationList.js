import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { getInitials, stringToColor, formatDate } from '../utils/helpers';

const ConversationList = ({ conversations, selectedUser, onSelectUser, onlineUsers = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = conversations.filter(conv =>
        conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="input pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        {searchTerm ? 'No chats found' : 'No conversations yet'}
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const isOnline = onlineUsers.includes(conv.user._id);
                        const isSelected = selectedUser && selectedUser._id === conv.user._id;

                        return (
                            <div
                                key={conv.user._id}
                                onClick={() => onSelectUser(conv.user)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex gap-3 ${isSelected ? 'bg-blue-50 dark:bg-gray-700' : ''
                                    }`}
                            >
                                <div className="relative">
                                    {conv.user.photo ? (
                                        <img
                                            src={conv.user.photo}
                                            alt={conv.user.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                            style={{ backgroundColor: stringToColor(conv.user.name) }}
                                        >
                                            {getInitials(conv.user.name)}
                                        </div>
                                    )}
                                    {isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {conv.user.name}
                                        </h3>
                                        {// Show time if today, date if older
                                            new Date(conv.lastMessage.createdAt).toDateString() === new Date().toDateString()
                                                ? <span className="text-xs text-gray-500">{new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                : <span className="text-xs text-gray-500">{new Date(conv.lastMessage.createdAt).toLocaleDateString()}</span>
                                        }
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-500 truncate w-4/5">
                                            {conv.lastMessage.senderId === conv.user._id ? '' : 'You: '}
                                            {conv.lastMessage.message}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;
