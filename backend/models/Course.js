import mongoose from 'mongoose';

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    provider: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        required: true,
    },
    courseUrl: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true,
    },
    tags: [{
        type: String,
        required: true,
    }],
    price: {
        type: Number,
        required: true,
    },
    isFree: {
        type: Boolean,
        required: true,
    },
    thumbnailUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop',
    },
    rating: {
        type: Number,
        default: 0,
    },
    duration: {
        type: String,
        default: "Self-paced",
    },
    language: {
        type: String,
        default: "English",
    },
    enrollments: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
