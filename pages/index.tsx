import { useEffect, useState } from "react";
import io from "socket.io-client";

type Grade = {
  id: number;
  studentId: number;
  subject: string;
  term: string;
  score: number;
  grade: string;
  createdAt: string;
};

type Invoice = {
  id: number;
  studentId: number;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
};

let socket: any;

export default function Home() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState<number>(0);
  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);

  useEffect(() => {
    // connect socket
    socket = io();

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
    });

    socket.on("grades:update", (payload: Grade) => {
      setGrades((prev) => [payload, ...prev]);
    });

    socket.on("invoices:update", (payload: Invoice) => {
      setInvoices((prev) => [payload, ...prev]);
    });

    fetch("/api/results")
      .then((r) => r.json())
      .then((data) => setGrades(data));

    fetch("/api/fees")
      .then((r) => r.json())
      .then((data) => setInvoices(data));

    return () => {
      socket.disconnect();
    };
  }, []);

  async function submitGrade(e: any) {
    e.preventDefault();
    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: 1,
        subject,
        term: "Term 1",
        score,
      }),
    });
    if (res.ok) {
      setSubject("");
      setScore(0);
    }
  }

  async function createInvoice(e: any) {
    e.preventDefault();
    const res = await fetch("/api/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: 1,
        description: invoiceDesc,
        amount: invoiceAmount,
      }),
    });
    if (res.ok) {
      setInvoiceDesc("");
      setInvoiceAmount(0);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">SIVILIE HIGH SCHOOL — Dashboard</h1>
        <p className="text-sm text-gray-600 mb-6">Real-time results & fees demo</p>

        <div className="grid grid-cols-2 gap-6">
          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Publish Result (demo)</h2>
            <form onSubmit={submitGrade} className="space-y-2">
              <input className="w-full border p-2" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              <input className="w-full border p-2" type="number" placeholder="Score" value={score} onChange={(e) => setScore(Number(e.target.value))} required />
              <button className="bg-blue-600 text-white px-3 py-2 rounded">Publish Grade</button>
            </form>

            <h3 className="mt-4 font-semibold">Recent Grades</h3>
            <ul className="mt-2 space-y-2">
              {grades.map((g) => (
                <li key={g.id} className="text-sm border p-2 rounded">
                  {g.subject} — {g.score} ({g.grade}) <span className="text-xs text-gray-500">· {new Date(g.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Create Invoice (demo)</h2>
            <form onSubmit={createInvoice} className="space-y-2">
              <input className="w-full border p-2" placeholder="Description" value={invoiceDesc} onChange={(e) => setInvoiceDesc(e.target.value)} required />
              <input className="w-full border p-2" type="number" placeholder="Amount" value={invoiceAmount} onChange={(e) => setInvoiceAmount(Number(e.target.value))} required />
              <button className="bg-green-600 text-white px-3 py-2 rounded">Create Invoice</button>
            </form>

            <h3 className="mt-4 font-semibold">Recent Invoices</h3>
            <ul className="mt-2 space-y-2">
              {invoices.map((inv) => (
                <li key={inv.id} className="text-sm border p-2 rounded">
                  {inv.description} — {inv.amount} KES <span className="text-xs text-gray-500">· {inv.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
