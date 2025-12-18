const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'info', 'success', 'error', 'warning'
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedBookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
