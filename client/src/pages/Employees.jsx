import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';

const blank = { code: '', firstName: '', lastName: '', address: '', phone: '', designation: '' };

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null); // null = closed
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setRows(await api(`/employees?q=${encodeURIComponent(q)}`));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);
  useEffect(() => {
    api('/categories').then(setCats).catch((e) => setError(e.message));
  }, []);

  const open = (emp) => {
    setError('');
    setEditing(Boolean(emp));
    setForm(emp ? { ...emp } : { ...blank, designation: cats[0]?.name || '' });
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api(`/employees/${encodeURIComponent(form.code)}`, { method: 'PUT', body: form });
      else await api('/employees', { method: 'POST', body: form });
      setForm(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(emp) {
    if (!window.confirm(`Delete ${emp.firstName} ${emp.lastName} (${emp.code})?`)) return;
    try {
      await api(`/employees/${encodeURIComponent(emp.code)}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Employees</h1>
        <button className="primary" onClick={() => open(null)} disabled={!cats.length} title={!cats.length ? 'Add a salary structure first' : ''}>
          Add employee
        </button>
      </header>

      <input className="search" placeholder="Search by name, code or designation" value={q} onChange={(e) => setQ(e.target.value)} />
      {error && !form && <p className="error" role="alert">{error}</p>}
      {!cats.length && !loading && <p className="notice">Add a salary structure first, then you can add employees to it.</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Code</th><th>Name</th><th>Designation</th><th>Phone</th><th>Address</th><th /></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code}>
                <td>{r.code}</td>
                <td>{r.firstName} {r.lastName}</td>
                <td>{r.designation}</td>
                <td>{r.phone}</td>
                <td>{r.address}</td>
                <td className="actions">
                  <button className="link" onClick={() => open(r)}>Edit</button>
                  <button className="link danger" onClick={() => remove(r)}>Delete</button>
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr><td colSpan="6" className="empty">{q ? 'No employees match your search.' : 'No employees yet. Add the first one.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={editing ? `Edit ${form.code}` : 'Add employee'} onClose={() => setForm(null)}>
          <form onSubmit={save} className="form-grid">
            <label>Employee code
              <input value={form.code} onChange={set('code')} disabled={editing} required />
            </label>
            <label>Designation
              <select value={form.designation} onChange={set('designation')} required>
                {!cats.some((c) => c.name === form.designation) && <option value={form.designation}>{form.designation || 'Choose…'}</option>}
                {cats.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </label>
            <label>First name
              <input value={form.firstName} onChange={set('firstName')} required />
            </label>
            <label>Last name
              <input value={form.lastName} onChange={set('lastName')} />
            </label>
            <label>Phone
              <input value={form.phone} onChange={set('phone')} />
            </label>
            <label>Address
              <input value={form.address} onChange={set('address')} />
            </label>
            {error && <p className="error full" role="alert">{error}</p>}
            <div className="form-actions full">
              <button type="button" onClick={() => setForm(null)}>Cancel</button>
              <button className="primary">{editing ? 'Save changes' : 'Add employee'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
