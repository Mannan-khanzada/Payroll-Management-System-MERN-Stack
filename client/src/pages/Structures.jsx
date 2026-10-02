import { useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import { ALLOWANCES, DEDUCTIONS, money, preview } from '../format';

const comp = () => ({ value: 0, percent: false });
const blank = () => ({
  name: '', basicPay: 0,
  ...Object.fromEntries([...ALLOWANCES, ...DEDUCTIONS].map(([k]) => [k, comp()])),
});

export default function Structures() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/categories').then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const setField = (k, v) => setForm({ ...form, [k]: v });
  const setComp = (k, patch) => setForm({ ...form, [k]: { ...form[k], ...patch } });

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form, basicPay: Number(form.basicPay) };
      if (form._id) await api(`/categories/${form._id}`, { method: 'PUT', body });
      else await api('/categories', { method: 'POST', body });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(cat) {
    if (!window.confirm(`Delete the "${cat.name}" salary structure?`)) return;
    try {
      await api(`/categories/${cat._id}`, { method: 'DELETE' });
      setError('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const row = ([k, label]) => (
    <div className="comp-row" key={k}>
      <span>{label}</span>
      <input type="number" min="0" value={form[k].value} onChange={(e) => setComp(k, { value: e.target.value })} aria-label={`${label} value`} />
      <label className="check">
        <input type="checkbox" checked={form[k].percent} onChange={(e) => setComp(k, { percent: e.target.checked })} />
        % of basic
      </label>
    </div>
  );

  return (
    <>
      <header className="page-head">
        <h1>Salary structures</h1>
        <button className="primary" onClick={() => { setError(''); setForm(blank()); }}>Add structure</button>
      </header>
      <p className="muted lead">Each designation has one structure. Employees take their pay from the structure that matches their designation.</p>
      {error && !form && <p className="error" role="alert">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Designation</th><th className="num">Basic pay</th><th className="num">Allowances</th><th className="num">Deductions</th><th className="num">Net salary</th><th /></tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const p = preview(c);
              return (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td className="num">{money(c.basicPay)}</td>
                  <td className="num plus">{money(p.allow)}</td>
                  <td className="num minus">{money(p.dedu)}</td>
                  <td className="num strong">{money(p.net)}</td>
                  <td className="actions">
                    <button className="link" onClick={() => { setError(''); setForm(structuredClone(c)); }}>Edit</button>
                    <button className="link danger" onClick={() => remove(c)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan="6" className="empty">No salary structures yet. Add one for each designation.</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form._id ? `Edit ${form.name}` : 'Add salary structure'} onClose={() => setForm(null)}>
          <form onSubmit={save}>
            <div className="form-grid">
              <label>Designation
                <input value={form.name} onChange={(e) => setField('name', e.target.value)} required />
              </label>
              <label>Basic pay
                <input type="number" min="0" value={form.basicPay} onChange={(e) => setField('basicPay', e.target.value)} required />
              </label>
            </div>
            <h3 className="plus">Allowances</h3>
            {ALLOWANCES.map(row)}
            <h3 className="minus">Deductions</h3>
            {DEDUCTIONS.map(row)}
            {(() => {
              const p = preview(form);
              return (
                <p className="preview">
                  Net salary for this structure: <strong>{money(p.net)}</strong>
                  <span className="muted"> ({money(form.basicPay)} + {money(p.allow)} − {money(p.dedu)})</span>
                </p>
              );
            })()}
            {error && <p className="error" role="alert">{error}</p>}
            <div className="form-actions">
              <button type="button" onClick={() => setForm(null)}>Cancel</button>
              <button className="primary">Save structure</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
