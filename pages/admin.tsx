import { useEffect, useState } from "react";

export default function AdminPage() {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  async function sendSMS(e: any) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message }),
    });
    if (res.ok) {
      setStatus("sent");
      setTo("");
      setMessage("");
    } else {
      const body = await res.text();
      setStatus("error: " + body);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin — SIVILIE HIGH SCHOOL</h1>

        <section className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-2">Send SMS (Africa's Talking)</h2>
          <form onSubmit={sendSMS} className="space-y-2">
            <input className="w-full border p-2" placeholder="+2547..." value={to} onChange={(e) => setTo(e.target.value)} />
            <textarea className="w-full border p-2" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button className="bg-blue-600 text-white px-3 py-2 rounded">Send SMS</button>
          </form>
          <div className="text-sm mt-2">Status: {status ?? "idle"}</div>
        </section>

        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Students</h2>
          <ul className="space-y-2">
            {students.map((s) => (
              <li key={s.id} className="border p-2 rounded">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">Admission: {s.admission}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
