import React from 'react';
import { formatTime } from '../utils/helpers';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwn }) => {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] ${isOwn ? 'bg-primary text-white rounded-l-lg rounded-tr-lg' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-r-lg rounded-tl-lg shadow-sm'} px-4 py-2 relative group`}>
                <p className="text-sm">{message.message}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                    <span>{formatTime(message.createdAt)}</span>
                    {isOwn && (
                        <span>
                            {message.read ? (
                                <CheckCheck className="w-3 h-3" />
                            ) : (
                                <Check className="w-3 h-3" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
