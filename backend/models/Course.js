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
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    tags: [{
        type: String,
        required: true,
    }],
    skills: {
        type: [String],
        default: [],
    },
    outcomes: {
        type: [String],
        default: [],
    },
    prerequisites: {
        type: [String],
        default: [],
    },
    syllabus: {
        type: [String],
        default: [],
    },
    price: {
        type: Number,
        required: true,
    },
    isFree: {
        type: Boolean,
        required: true,
    },
    certificate: {
        type: Boolean,
        default: false,
    },
    thumbnailUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop',
    },
    rating: {
        type: Number,
        default: 0,
    },
    ratingCount: {
        type: Number,
        default: 0,
    },
    reviewHighlights: {
        type: [String],
        default: [],
    },
    duration: {
        type: String,
        default: "Self-paced",
    },
    durationWeeks: {
        type: Number,
    },
    durationHours: {
        type: Number,
    },
    language: {
        type: String,
        default: "English",
    },
    subtitles: {
        type: [String],
        default: [],
    },
    lastUpdated: {
        type: Date,
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
