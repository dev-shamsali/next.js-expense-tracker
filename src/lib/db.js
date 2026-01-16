import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
}

/**
 * Global cache for MongoDB connection
 * Prevents multiple connections in Next.js hot reload
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            maxPoolSize: 5,              // ⬅ limit sockets
            minPoolSize: 1,
            serverSelectionTimeoutMS: 5000, // ⬅ fail fast
            socketTimeoutMS: 45000,
            retryWrites: true,
            tls: true,                   // ⬅ force TLS
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
