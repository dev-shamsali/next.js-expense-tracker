import mongoose from "mongoose";

/**
 * Schema = structure of your data
 */
const ExpenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

/**
 * Prevents model overwrite error in Next.js
 */
export default mongoose.models.Expense ||
    mongoose.model("Expense", ExpenseSchema);
