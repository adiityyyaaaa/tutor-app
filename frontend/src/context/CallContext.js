import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
    const { user } = useAuth();
    const [call, setCall] = useState(null); // { isIncoming, isOutgoing, isOngoing, otherUser, ... }
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const peerRef = useRef(null);
    const socket = socketService.socket;

    // Call Status: idle, calling, incoming, connected, ending
    const [callStatus, setCallStatus] = useState('idle');

    useEffect(() => {
        if (!user || !socket) return;

        socketService.onIncomingCall((data) => {
            // data: { from, name, offer, signal }
            if (callStatus !== 'idle') {
                // Busy
                // Ideally emit "busy"
                return;
            }
            setCall({
                isIncoming: true,
                otherUser: { _id: data.from, name: data.name },
                offer: data.offer,
                signal: data.signal
            });
            setCallStatus('incoming');
        });

        socketService.onCallAccepted((data) => {
            // data: { signal, answer }
            if (callStatus === 'calling') {
                setCallStatus('connected');
                if (peerRef.current) {
                    peerRef.current.setRemoteDescription(new RTCSessionDescription(data.signal || data.answer));
                }
            }
        });

        socketService.onCallRejected(() => {
            endCall();
            alert('Call rejected');
        });

        socketService.onIceCandidate((data) => {
            if (peerRef.current) {
                peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        socketService.onCallEnded(() => {
            endCall();
        });

        return () => {
            // Cleanup listeners handled in CallManager or via socketService methods if needed,
            // but socketService methods add listeners, they don't replace.
            // Ideally we should remove listeners on unmount.
            // keeping it simple for now.
        };
    }, [user, socket, callStatus]);

    const startCall = async (otherUser) => {
        setCallStatus('calling');
        setCall({ isOutgoing: true, otherUser });

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setLocalStream(stream);

            const peer = createPeer();
            peerRef.current = peer;

            stream.getTracks().forEach(track => peer.addTrack(track, stream));

            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            socketService.callUser({
                to: otherUser._id,
                offer: offer,
                from: user._id,
                name: user.name
            });

        } catch (err) {
            console.error('Error starting call:', err);
            endCall();
            alert('Could not access microphone');
        }
    };

    const acceptCall = async () => {
        setCallStatus('connected');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setLocalStream(stream);

            const peer = createPeer();
            peerRef.current = peer;

            stream.getTracks().forEach(track => peer.addTrack(track, stream));

            await peer.setRemoteDescription(new RTCSessionDescription(call.signal || call.offer));

            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socketService.acceptCall({
                to: call.otherUser._id,
                answer: answer
            });

        } catch (err) {
            console.error('Error accepting call:', err);
            endCall();
        }
    };

    const rejectCall = () => {
        socketService.rejectCall({ to: call.otherUser._id });
        endCall();
    };

    const endCall = () => {
        if (call?.otherUser) {
            socketService.endCall({ to: call.otherUser._id });
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }
        setRemoteStream(null);
        setCall(null);
        setCallStatus('idle');
    };

    const createPeer = () => {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        });

        peer.onicecandidate = (event) => {
            if (event.candidate && call?.otherUser) {
                socketService.sendIceCandidate({
                    to: call.otherUser._id,
                    candidate: event.candidate
                });
            }
        };

        peer.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        return peer;
    };

    return (
        <CallContext.Provider value={{
            call,
            callStatus,
            localStream,
            remoteStream,
            startCall,
            acceptCall,
            rejectCall,
            endCall
        }}>
            {children}
        </CallContext.Provider>
    );
};
