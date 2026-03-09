import dotenv from 'dotenv';
import Course from '../models/Course.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const insertCourses = async () => {
    try {
        await connectDB();

        await Course.deleteMany();
        console.log('Courses deleted.');

        const dataPath = path.join(__dirname, '../data/courses.json');
        const fileData = fs.readFileSync(dataPath, 'utf-8');
        const courses = JSON.parse(fileData);

        await Course.insertMany(courses);
        console.log(`Imported ${courses.length} courses successfully.`);

        process.exit();
    } catch (error) {
        console.error(`Error seeding courses: ${error}`);
        process.exit(1);
    }
};

insertCourses();
