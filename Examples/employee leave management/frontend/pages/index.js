import { useEffect, useState } from 'react';

function getApiBase() {
  if (typeof window !== 'undefined' && window.configs && window.configs.apiUrl) return window.configs.apiUrl;
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
}

export default function Home() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${getApiBase()}/api/v1/leaves`);
        const json = await res.json();
        setLeaves(json.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Employee Leave Requests</h1>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Approver</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map(l => (
            <tr key={l.id}>
              <td>{l.employee_id}</td>
              <td>{l.start_date}</td>
              <td>{l.end_date}</td>
              <td>{l.status}</td>
              <td>{l.approver_email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
