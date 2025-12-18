const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Message = require('./models/Message');
const User = require('./models/User');
const Teacher = require('./models/Teacher');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const seedChat = async () => {
    try {
        const student = await User.findOne({ email: 'student@demo.com' });
        const teacher = await Teacher.findOne({ email: 'teacher@demo.com' });

        if (!student || !teacher) {
            console.log('Student or Teacher not found');
            process.exit(1);
        }

        console.log(`Found Student: ${student._id}`);
        console.log(`Found Teacher: ${teacher._id}`);

        await Message.create({
            senderId: student._id,
            senderType: 'User',
            receiverId: teacher._id,
            receiverType: 'Teacher',
            message: 'Hello sir, I am interested in Math tuition for Class 10.',
            messageType: 'text',
            read: false,
            createdAt: new Date(Date.now() - 3600000) // 1 hour ago
        });

        console.log('Initial message created!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedChat();
