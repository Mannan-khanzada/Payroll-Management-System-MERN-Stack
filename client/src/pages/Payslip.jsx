import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { ALLOWANCES, DEDUCTIONS, money } from '../format';

const monthLabel = (m) =>
  new Date(`${m}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export default function Payslip() {
  const { code } = useParams();
  const [params] = useSearchParams();
  const month = params.get('month') || new Date().toISOString().slice(0, 7);
  const [slip, setSlip] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/payroll/${encodeURIComponent(code)}?month=${month}`).then(setSlip).catch((e) => setError(e.message));
  }, [code, month]);

  return (
    <>
      <header className="page-head no-print">
        <h1><Link to="/payslips" className="crumb">Payslips</Link> / {code}</h1>
        {slip && <button className="primary" onClick={() => window.print()}>Print payslip</button>}
      </header>
      {error && <p className="error" role="alert">{error}</p>}

      {slip && (
        <article className="slip">
          <header>
            <h2>Payslip</h2>
            <p>{monthLabel(slip.month)}</p>
          </header>
          <dl className="slip-who">
            <div><dt>Employee</dt><dd>{slip.employee.name}</dd></div>
            <div><dt>Code</dt><dd>{slip.employee.code}</dd></div>
            <div><dt>Designation</dt><dd>{slip.employee.designation}</dd></div>
            <div><dt>Issued</dt><dd>{new Date(slip.generatedOn).toLocaleDateString('en-GB')}</dd></div>
          </dl>

          <table className="slip-table">
            <tbody>
              <tr className="slip-basic"><th>Basic pay</th><td>{money(slip.basicPay)}</td></tr>
              <tr className="slip-group"><th colSpan="2">Allowances</th></tr>
              {ALLOWANCES.map(([k, label]) => (
                <tr key={k}><th>{label}</th><td>{money(slip.allowances[k])}</td></tr>
              ))}
              <tr className="slip-total"><th>Total allowances</th><td>{money(slip.totalAllowance)}</td></tr>
              <tr className="slip-group"><th colSpan="2">Deductions</th></tr>
              {DEDUCTIONS.map(([k, label]) => (
                <tr key={k}><th>{label}</th><td>−{money(slip.deductions[k])}</td></tr>
              ))}
              <tr className="slip-total"><th>Total deductions</th><td>−{money(slip.totalDeduction)}</td></tr>
            </tbody>
          </table>

          <div className="slip-net">
            <span>Net salary</span>
            <strong>{money(slip.netSalary)}</strong>
          </div>
        </article>
      )}
    </>
  );
}
