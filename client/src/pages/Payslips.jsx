import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { money } from '../format';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Payslips() {
  const [month, setMonth] = useState(thisMonth());
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!month) return;
    api(`/payroll?month=${month}`)
      .then((d) => { setRows(d.rows); setError(''); })
      .catch((e) => setError(e.message));
  }, [month]);

  const total = rows.reduce((s, r) => s + (r.netSalary || 0), 0);

  return (
    <>
      <header className="page-head">
        <h1>Payslips</h1>
        <label className="inline">Salary month
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
      </header>
      {error && <p className="error" role="alert">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Code</th><th>Name</th><th>Designation</th><th className="num">Basic pay</th><th className="num">Allowances</th><th className="num">Deductions</th><th className="num">Net salary</th><th /></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.employee.code}>
                <td>{r.employee.code}</td>
                <td>{r.employee.name}</td>
                <td>{r.employee.designation}</td>
                {r.missingStructure ? (
                  <td colSpan="5" className="minus">No salary structure named “{r.employee.designation}”</td>
                ) : (
                  <>
                    <td className="num">{money(r.basicPay)}</td>
                    <td className="num plus">{money(r.totalAllowance)}</td>
                    <td className="num minus">{money(r.totalDeduction)}</td>
                    <td className="num strong">{money(r.netSalary)}</td>
                    <td className="actions"><Link to={`/payslips/${encodeURIComponent(r.employee.code)}?month=${month}`}>View payslip</Link></td>
                  </>
                )}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="8" className="empty">No employees to pay yet.</td></tr>}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr><td colSpan="6">Total net salary for {month}</td><td className="num strong">{money(total)}</td><td /></tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  );
}
