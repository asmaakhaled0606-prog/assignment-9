import mongoose from "mongoose"

export default async function connectDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/srahaApp", { serverSelectionTimeoutMS: 5000 });
        console.log("Database connected succesfully😍");
    } catch (error) {
        console.log("Database connection failed😭");
    }
}