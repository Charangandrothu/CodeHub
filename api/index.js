
import app from '../server/src/app.js';
import connectDB from '../server/src/config/db.js';
import mongoose from 'mongoose';

export default async (req, res) => {
    if (mongoose.connection.readyState === 0) {
        await connectDB();
    }

    app(req, res);
};
