import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";

/**
 * PUT /api/expenses/[id]
 */
export async function PUT(req, context) {
    try {
        const { id } = await context.params;

        await connectDB();
        const body = await req.json();

        const updated = await Expense.findByIdAndUpdate(
            id,
            body,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json(
                { error: "Expense not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/expenses/[id]
 */
export async function DELETE(req, context) {
    try {
        const { id } = await context.params;

        await connectDB();

        const deleted = await Expense.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json(
                { error: "Expense not found" },
                { status: 404 }
            );
        }

        // ✅ return deleted id explicitly
        return NextResponse.json({ deletedId: id });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
