require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

// Socket.io configuration
const io = socketio(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); 
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/payments', require('./routes/payments'));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Socket.io connection handling
const users = new Map(); // Map to store userId -> socketId

io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // User joins their room
    socket.on('join', (userId) => {
        users.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} joined with socket ${socket.id}`);

        // Notify user's contacts that they're online
        socket.broadcast.emit('user-online', userId);
    });

    // Send message
    socket.on('send-message', async (data) => {
        const { senderId, receiverId, message, messageType, senderType, receiverType } = data;

        try {
            // Save message to database
            const Message = require('./models/Message');
            const newMessage = await Message.create({
                senderId,
                senderType,
                receiverId,
                receiverType,
                message,
                messageType: messageType || 'text',
                read: false
            });

            await newMessage.populate('senderId', 'name photo');
            await newMessage.populate('receiverId', 'name photo');

            // Emit to receiver
            const receiverSocketId = users.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive-message', newMessage);
            }

            // Confirm to sender
            socket.emit('message-sent', newMessage);
        } catch (error) {
            console.error('Send message error:', error);
            socket.emit('message-error', { error: error.message });
        }
    });

    // Typing indicator
    socket.on('typing', (data) => {
        const { receiverId } = data;
        const receiverSocketId = users.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing', data);
        }
    });

    // Stop typing
    socket.on('stop-typing', (data) => {
        const { receiverId } = data;
        const receiverSocketId = users.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('stop-typing', data);
        }
    });

    // Read receipt
    socket.on('read-receipt', async (data) => {
        const { messageId, senderId } = data;

        try {
            const Message = require('./models/Message');
            await Message.findByIdAndUpdate(messageId, { read: true });

            const senderSocketId = users.get(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('message-read', { messageId });
            }
        } catch (error) {
            console.error('Read receipt error:', error);
        }
    });

    // Audio call signaling
    socket.on('call-user', (data) => {
        const { to, offer, from, name } = data;
        const receiverSocketId = users.get(to);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('incoming-call', {
                from,
                name,
                offer,
                signal: offer
            });
        }
    });

    socket.on('accept-call', (data) => {
        const { to, answer } = data;
        const callerSocketId = users.get(to);

        if (callerSocketId) {
            io.to(callerSocketId).emit('call-accepted', {
                signal: answer,
                answer
            });
        }
    });

    socket.on('reject-call', (data) => {
        const { to } = data;
        const callerSocketId = users.get(to);

        if (callerSocketId) {
            io.to(callerSocketId).emit('call-rejected');
        }
    });

    socket.on('ice-candidate', (data) => {
        const { to, candidate } = data;
        const receiverSocketId = users.get(to);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('ice-candidate', { candidate });
        }
    });

    socket.on('end-call', (data) => {
        const { to } = data;
        const receiverSocketId = users.get(to);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('call-ended');
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);

        // Find and remove user from map
        for (const [userId, socketId] of users.entries()) {
            if (socketId === socket.id) {
                users.delete(userId);
                // Notify user's contacts that they're offline
                socket.broadcast.emit('user-offline', userId);
                break;
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
