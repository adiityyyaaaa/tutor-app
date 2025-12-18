const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Teacher = require('./models/Teacher');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedTeacher = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Check if teacher exists
        const existingTeacher = await Teacher.findOne({ email: 'teacher_demo@example.com' });
        if (existingTeacher) {
            console.log('Demo teacher already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const teacher = await Teacher.create({
            name: 'Demo Teacher',
            email: 'teacher_demo@example.com',
            password: hashedPassword,
            phone: '9876543210',
            aadhaarNumber: '123456789012',
            hourlyRate: 500,
            monthlyRate: 5000,
            experience: 5,
            subjects: ['Mathematics', 'Physics'],
            boards: ['CBSE'],
            address: {
                street: '123 Main St',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                coordinates: {
                    type: 'Point',
                    coordinates: [72.8777, 19.0760]
                }
            },
            role: 'teacher'
        });

        console.log('Demo Teacher Created:', teacher.email);
        process.exit();
    } catch (error) {
        console.error('Error seeding teacher:', error);
        process.exit(1);
    }
};

seedTeacher();
