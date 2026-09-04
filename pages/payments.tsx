import { useEffect, useState } from "react";

type Invoice = {
  id: number;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    const r = await fetch("/api/fees");
    const data = await r.json();
    setInvoices(data);
    setLoading(false);
  }

  async function simulatePay(inv: Invoice) {
    setMessage("processing...");
    const providerTx = `sim-${Date.now()}`;
    const res = await fetch("/api/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "SIMULATOR",
        providerTx,
        invoiceId: inv.id,
        amount: inv.amount,
      }),
    });
    if (res.ok) {
      setMessage("Payment processed for invoice " + inv.id);
      // refresh invoices to pick up PAID status; the webhook also emits a socket event if socket.io is running
      setTimeout(() => refresh(), 300);
    } else {
      const text = await res.text();
      setMessage("Error: " + text);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Payments — SIVILIE HIGH SCHOOL</h1>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Invoices</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ul className="space-y-2">
              {invoices.map((inv) => (
                <li key={inv.id} className="border p-3 rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{inv.description}</div>
                    <div className="text-xs text-gray-500">KES {inv.amount} · {inv.status}</div>
                  </div>
                  <div>
                    {inv.status !== "PAID" && (
                      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => simulatePay(inv)}>Simulate Pay</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-sm text-gray-600">{message}</div>
        </div>
      </div>
    </div>
  );
}
