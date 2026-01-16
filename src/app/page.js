"use client";

import { useEffect, useState, useMemo } from "react";
import { Trash2, Edit2, Plus, X } from "lucide-react";

/* ---------------- SAFE FETCH ---------------- */
async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  return res.json();
}

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const categories = [
    { name: "All" },
    { name: "Food" },
    { name: "Transport" },
    { name: "Shopping" },
    { name: "Bills" },
    { name: "Entertainment" },
    { name: "Health" },
    { name: "Education" },
    { name: "Investment" },
    { name: "Other" },
  ];

  /* ---------------- LOAD ---------------- */
  async function loadExpenses() {
    try {
      const data = await safeFetch("/api/expenses");
      setExpenses(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load expenses");
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  /* ---------------- CREATE / UPDATE ---------------- */
  async function handleSubmit() {
    if (!form.title || !form.amount || !form.category) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/expenses/${editingId}`
        : "/api/expenses";

      const saved = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setExpenses((prev) =>
        editingId
          ? prev.map((e) => (e._id === editingId ? saved : e))
          : [saved, ...prev]
      );

      resetForm();
    } catch (err) {
      alert(err.message);
    }
  }

  /* ---------------- DELETE ---------------- */
  async function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;

    try {
      const res = await safeFetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      setExpenses((prev) =>
        prev.filter(
          (e) => e._id?.toString() !== res.deletedId.toString()
        )
      );
    } catch (err) {
      alert(err.message);
    }
  }

  /* ---------------- EDIT ---------------- */
  function editExpense(exp) {
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: exp.date
        ? new Date(exp.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      description: exp.description || "",
    });

    setEditingId(exp._id);
    setIsFormOpen(true);
  }

  function resetForm() {
    setForm({
      title: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setEditingId(null);
    setIsFormOpen(false);
  }

  /* ---------------- FILTERING ---------------- */
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesCategory =
        selectedCategory === "All" || exp.category === selectedCategory;

      const matchesSearch =
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const d = new Date(exp.date);
        matchesDate =
          d >= new Date(dateRange.start) &&
          d <= new Date(dateRange.end);
      }

      return matchesCategory && matchesSearch && matchesDate;
    });
  }, [expenses, selectedCategory, searchTerm, dateRange]);

  /* ---------------- STATS ---------------- */
  const totalExpenses = useMemo(
    () =>
      filteredExpenses.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0
      ),
    [filteredExpenses]
  );

  /* ---------------- UI ---------------- */
  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Expense
        </button>
      </header>

      <p className="mb-4 font-semibold">
        Total: ₹{totalExpenses.toLocaleString("en-IN")}
      </p>

      <div className="space-y-3">
        {filteredExpenses.map((exp) => (
          <div
            key={exp._id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{exp.title}</p>
              <p className="text-sm text-gray-500">
                {exp.category} ·{" "}
                {new Date(exp.date).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-bold text-amber-700">
                ₹{Number(exp.amount).toLocaleString("en-IN")}
              </p>
              <button
                onClick={() => editExpense(exp)}
                className="text-blue-600"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => deleteExpense(exp._id)}
                className="text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Expense" : "Add Expense"}
            </h2>

            <input
              className="w-full border p-2 mb-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <input
              className="w-full border p-2 mb-2"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />

            <select
              className="w-full border p-2 mb-2"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="">Select category</option>
              {categories
                .filter((c) => c.name !== "All")
                .map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>

            <input
              className="w-full border p-2 mb-2"
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 mb-4"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <div className="flex gap-2">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-200 p-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-amber-600 text-white p-2 rounded"
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
