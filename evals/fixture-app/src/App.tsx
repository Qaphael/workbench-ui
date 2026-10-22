import { useMemo, useState } from 'react';
import type { Invoice, InvoiceStatus } from './types';

const INVOICES: Invoice[] = [
  { id: 'INV-1041', customer: 'Kampala Print Works', amount: 1480000, issued: '2026-10-02', status: 'paid' },
  { id: 'INV-1042', customer: 'Nakasero Agro', amount: 620000, issued: '2026-10-03', status: 'due' },
  { id: 'INV-1043', customer: 'Gulu Coffee Union', amount: 2310000, issued: '2026-10-05', status: 'overdue' },
  { id: 'INV-1044', customer: 'Mbarara Traders', amount: 940000, issued: '2026-10-06', status: 'paid' },
  { id: 'INV-1045', customer: 'Jinja Medical Centre', amount: 3150000, issued: '2026-10-08', status: 'due' },
  { id: 'INV-1046', customer: 'Mbale Schools', amount: 480000, issued: '2026-10-09', status: 'paid' },
];

const FILTERS: Array<{ key: 'all' | InvoiceStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'due', label: 'Due' },
  { key: 'overdue', label: 'Overdue' },
];

export default function App() {
  // --- toolbar ---
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICES.filter((invoice) => {
      const matchesFilter = filter === 'all' || invoice.status === filter;
      const matchesQuery =
        !q ||
        invoice.customer.toLowerCase().includes(q) ||
        invoice.id.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  const paidTotal = visible
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="app">
      {/* ---------------------------------------------------------------- */}
      <div className="toolbar">
        <h1 className="toolbar-title">Ledgerly</h1>
        <input
          className="toolbar-search"
          placeholder="Search invoices"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="toolbar-spacer" />
        <button className="btn" onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? 'Hide archived' : 'Show archived'}
        </button>
        <button className="btn btn-primary" onClick={() => setConfirmOpen(true)}>
          New invoice
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? 'chip on' : 'chip'}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------------- */}
      <div className="body">
        <div className="table-wrap">
          {visible.length === 0 ? (
            <div className="empty">No invoices match your search.</div>
          ) : (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Issued</th>
                  <th>Status</th>
                  <th className="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((invoice) => (
                  <tr key={invoice.id} onClick={() => setSelected(invoice)}>
                    <td>{invoice.id}</td>
                    <td>{invoice.customer}</td>
                    <td>{invoice.issued}</td>
                    <td>
                      <span className={`status ${invoice.status}`}>{invoice.status}</span>
                    </td>
                    <td className="amount">{invoice.amount.toLocaleString('en-UG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* -------------------------------------------------------------- */}
        <aside className="side-panel">
          <h2>{selected ? selected.id : 'No invoice selected'}</h2>
          <p>
            {selected
              ? `${selected.customer} — ${selected.amount.toLocaleString('en-UG')} UGX`
              : 'Pick an invoice from the table to see its details.'}
          </p>
          <div className="field">
            <label htmlFor="notes">Internal notes</label>
            <input id="notes" defaultValue="" />
          </div>
          <div className="field">
            <label htmlFor="owner">Owner</label>
            <select id="owner" defaultValue="accounts">
              <option value="accounts">Accounts</option>
              <option value="sales">Sales</option>
            </select>
          </div>
          <button className="btn" disabled={!selected} onClick={() => setConfirmOpen(true)}>
            Mark as paid
          </button>
        </aside>
      </div>

      {/* ---------------------------------------------------------------- */}
      <div className="status-bar">
        <span>{visible.length} invoices</span>
        <span>Paid: {paidTotal.toLocaleString('en-UG')} UGX</span>
        <div className="spacer" />
        <span>Ledgerly 0.4.2</span>
      </div>

      {/* ---------------------------------------------------------------- */}
      {confirmOpen && (
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create a new invoice?</h3>
            <p>A draft invoice will be created and you can fill in the details next.</p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setConfirmOpen(false);
                  setSelected(null);
                }}
              >
                Create invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
