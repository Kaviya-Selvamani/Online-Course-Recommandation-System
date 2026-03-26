import dotenv from 'dotenv';
import Course from '../models/Course.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODE = process.env.SEED_COURSES_MODE || 'merge'; // merge | overwrite

const buildCourseKey = (course = {}) =>
    [course.courseUrl, course.title, course.provider, course.platform]
        .map((value) => String(value || '').trim())
        .join('::');

const insertCourses = async () => {
    try {
        await connectDB();

        const dataPath = path.join(__dirname, '../data/courses.json');
        const fileData = fs.readFileSync(dataPath, 'utf-8');
        const courses = JSON.parse(fileData);

        if (!Array.isArray(courses) || courses.length === 0) {
            throw new Error('No courses found in backend/data/courses.json');
        }

        if (MODE === 'overwrite') {
            await Course.deleteMany();
            await Course.insertMany(courses);
            console.log(`Replaced courses collection with ${courses.length} courses.`);
            process.exit();
        }

        const existingCourses = await Course.find({}, '_id title provider platform courseUrl').lean();
        const existingByKey = new Map(existingCourses.map((course) => [buildCourseKey(course), course]));

        let inserted = 0;
        let updated = 0;

        for (const course of courses) {
            const key = buildCourseKey(course);
            const existing = existingByKey.get(key);

            if (existing?._id) {
                await Course.updateOne({ _id: existing._id }, { $set: course });
                updated += 1;
            } else {
                await Course.create(course);
                inserted += 1;
            }
        }

        console.log(`Course sync complete. Inserted ${inserted}, updated ${updated}, total source ${courses.length}.`);

        process.exit();
    } catch (error) {
        console.error(`Error seeding courses: ${error}`);
        process.exit(1);
    }
};

insertCourses();
