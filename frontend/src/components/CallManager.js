import React, { useEffect, useRef, useState } from 'react';
import { useCall } from '../context/CallContext';
import { Phone, PhoneOff, Mic, MicOff, User } from 'lucide-react';
import { getInitials, stringToColor } from '../utils/helpers';

const CallManager = () => {
    const { call, callStatus, localStream, remoteStream, acceptCall, rejectCall, endCall } = useCall();
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (audioRef.current && remoteStream) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.play().catch(e => console.error("Audio play error", e));
        }
    }, [remoteStream]);

    // Timer logic
    useEffect(() => {
        let interval;
        if (callStatus === 'connected') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [callStatus]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    if (callStatus === 'idle') return null;

    // Incoming Call Modal
    if (callStatus === 'incoming') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-80 text-center animate-bounce-in">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white shadow-lg animate-pulse"
                        style={{ backgroundColor: stringToColor(call.otherUser.name) }}>
                        {getInitials(call.otherUser.name)}
                    </div>
                    <h3 className="text-xl font-bold dark:text-white mb-1">{call.otherUser.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Incoming Audio Call...</p>

                    <div className="flex justify-center gap-8">
                        <button onClick={rejectCall} className="btn bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110">
                            <PhoneOff className="w-8 h-8" />
                        </button>
                        <button onClick={acceptCall} className="btn bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg animate-bounce transition-transform hover:scale-110">
                            <Phone className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Active Call Interface (Calling or Connected)
    return (
        <div className="fixed bottom-4 right-4 z-[90] w-72 bg-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            <div className="p-6 text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white border-4 border-gray-800"
                    style={{ backgroundColor: stringToColor(call.otherUser.name) }}>
                    {getInitials(call.otherUser.name)}
                </div>
                <h3 className="font-bold text-lg mb-1">{call.otherUser.name}</h3>
                <p className="text-sm text-gray-400 mb-2">
                    {callStatus === 'calling' ? 'Calling...' : 'Connected'}
                </p>
                {callStatus === 'connected' && (
                    <div className="flex flex-col items-center justify-center gap-1 mb-4">
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Live Audio
                        </div>
                        <div className="text-2xl font-mono font-bold tracking-wider">
                            {formatTime(duration)}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-800 p-4 flex justify-around">
                <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-white text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                    onClick={endCall}
                    className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                    <PhoneOff className="w-5 h-5" />
                </button>
            </div>

            <audio ref={audioRef} autoPlay />
        </div>
    );
};

export default CallManager;
