import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";

/**
 * GET /api/expenses
 * Fetch all expenses
 */
export async function GET() {
    await connectDB();
    const expenses = await Expense.find().sort({ date: -1 });
    return NextResponse.json(expenses);
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(req) {
    await connectDB();
    const body = await req.json();

    const expense = await Expense.create(body);
    return NextResponse.json(expense, { status: 201 });
}
