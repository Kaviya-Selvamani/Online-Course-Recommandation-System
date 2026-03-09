import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    skillLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    interests: [{
        type: String,
    }],
    careerGoal: {
        type: String,
    },
    weeklyLearningHours: {
        type: Number,
    },
    preferredPlatforms: [{
        type: String,
    }],
    learningPreference: {
        type: String,
        enum: ['Free Only', 'Paid Allowed'],
        default: 'Paid Allowed',
    },
    educationLevel: {
        type: String,
    },
    learningFormat: {
        type: String,
    },
    enrolledCourses: [String],
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
