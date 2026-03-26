import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillsSchema = new mongoose.Schema(
    {
        python: { type: Number, min: 0, max: 100, default: 0 },
        machineLearning: { type: Number, min: 0, max: 100, default: 0 },
        statistics: { type: Number, min: 0, max: 100, default: 0 },
        algorithms: { type: Number, min: 0, max: 100, default: 0 },
        dataScience: { type: Number, min: 0, max: 100, default: 0 },
    },
    { _id: false }
);

const learningPreferencesSchema = new mongoose.Schema(
    {
        preferredDifficultyLevel: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Intermediate',
        },
        preferredPlatforms: {
            type: [String],
            default: [],
        },
        learningFormat: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

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
    avatarUrl: {
        type: String,
    },
    emailVerified: {
        type: Boolean,
        default: true,
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
    learningGoal: {
        type: String,
    },
    careerTarget: {
        type: String,
        default: '',
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
        type: [String],
        default: [],
    },
    learningPreferences: {
        type: learningPreferencesSchema,
        default: () => ({}),
    },
    skills: {
        type: skillsSchema,
        default: () => ({}),
    },
    enrolledCourses: {
        type: [String],
        default: [],
    },
    completedCourses: {
        type: [String],
        default: [],
    },
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
