const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
            const errorMsg = 'MONGO_URI environment variable is not set or is empty';
            console.error(errorMsg);
            process.exit(1);
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected successfully : ${conn.connection.host}`);
    } catch (error) {
        console.log(`Connection failed : ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;