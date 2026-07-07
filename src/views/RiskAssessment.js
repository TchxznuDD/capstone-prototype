import React, { useState, useRef, useEffect } from 'react';
import { getAdminPassword } from '../utils/auth';
import Header from '../components/Header';
import './RiskAssessment.css';
import { mockRecords, assets, riskMatrix } from '../data/Matrix';

const VULNERABILITY_SUGGESTIONS = [
  'NO FIREWALL',
  'NO BACKUP',
  'Unpatched Software Versions',
  'NO MONITORING DASHBOARD',
  'SLOW ACCESS TO BFRIS DUE TO PAGE BOTTLENECKS',
];

const SEVERITY_OPTIONS = ['Acceptable', 'Tolerable', 'Undesirable', 'Intolerable'];
const LIKELIHOOD_OPTIONS = ['Improbable', 'Possible', 'Probable'];

function getRiskLevel(severity, likelihood) {
  if (!riskMatrix[likelihood] || !riskMatrix[likelihood][severity]) {
    return 'UNKNOWN';
  }
  return riskMatrix[likelihood][severity];
}

export default function RiskAssessment() {
  const fallbackMock = [
    { id: 'r1', asset: (Array.isArray(assets) && assets[0]) || 'Server and Host', vulnerability: 'NO FIREWALL', severity: 'Intolerable', likelihood: 'Probable', riskLevel: 'EXTREME' },
    { id: 'r2', asset: (Array.isArray(assets) && assets[1]) || 'Database', vulnerability: 'NO BACKUP', severity: 'Undesirable', likelihood: 'Possible', riskLevel: 'HIGH' },
  ];

  const [records, setRecords] = useState(Array.isArray(mockRecords) && mockRecords.length ? mockRecords : fallbackMock);
  const defaultAsset = (Array.isArray(assets) && assets.includes('Server and Host')) ? 'Server and Host' : ((Array.isArray(assets) && assets.length) ? assets[0] : '');
  const [asset, setAsset] = useState(defaultAsset);
  const [vuln, setVuln] = useState('');
  const [impact, setImpact] = useState('');
  const [threats, setThreats] = useState('');
  const [severity, setSeverity] = useState('Undesirable');
  const [likelihood, setLikelihood] = useState('Possible');
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('error');
  const toastTimerRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  function showToast(msg, duration = 3500, type = 'error') {
    setToast(msg);
    setToastType(type);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    toastTimerRef.current = setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, duration);
  }

  function clearToast() {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast('');
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && toast) clearToast();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toast]);

  const handleAddRisk = (e) => {
    e.preventDefault();
    if (!vuln || !vuln.trim()) {
      showToast('Please describe the vulnerability in plain language (a short sentence).');
      return;
    }
    if (!impact || !impact.trim()) {
      showToast('Please describe the impact in plain language.');
      return;
    }
    if (!threats || !threats.trim()) {
      showToast('Please describe the threats in plain language.');
      return;
    }
    const level = getRiskLevel(severity, likelihood);
    const newRecord = {
      id: `r${Date.now()}`,
      asset,
      vulnerability: vuln.trim() || '—',
      impact: impact.trim() || '—',
      threats: threats.trim() || '—',
      severity,
      likelihood,
      riskLevel: level,
    };
    setRecords(prev => [newRecord, ...prev]);
    setVuln('');
    setImpact('');
    setThreats('');
    setShowModal(false);
    showToast('Risk added successfully!', 2500, 'success');
  };

  const handleDelete = (id) => {
    // open password confirmation modal instead of immediate delete
    setDeleteTargetId(id);
    setDeletePassword('');
    setDeleteModalOpen(true);
  };

  // delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  function closeDeleteModal() {
    setDeleteModalOpen(false);
    setDeleteTargetId('');
    setDeletePassword('');
  }

  function handleConfirmDelete() {
    if (deletePassword !== getAdminPassword()) {
      showToast('Incorrect password. Please try again.');
      return;
    }
    setRecords(prev => prev.filter(r => r.id !== deleteTargetId));
    showToast('Risk deleted successfully!');
    closeDeleteModal();
  }

  const riskCounts = records.reduce((acc, record) => {
    const level = record.riskLevel || getRiskLevel(
      record.severity || 'Undesirable',
      record.likelihood || 'Possible'
    );
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});
  return (
    <div className="firewall-monitor-root dashboard-root">
      <Header active="risk" />

      <div className="hero-row">
        <div className="page-hero">
          <div className="hero-text">
            <h2>Risk Assessment</h2>
            <p>Create and view risk items using the severity/likelihood matrix.</p>
          </div>
        </div>

        <div className="external-refresh">
          <button className="refresh-btn" onClick={() => setShowModal(true)}>
            Add New Risk
          </button>
        </div>
      </div>

      <section className="monitor-stats">
        <div className="stat-card stat-extreme">
          <div>
            <p className="label">Extreme</p>
            <p className="value" style={{ color: '#d62828' }}>{riskCounts['EXTREME'] || 0}</p>
          </div>
          <div className="stat-icon">
            <div className="icon-bg" style={{ color: '#d62828' }}>
              <svg viewBox="0 0 24 24" className="stat-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card stat-high">
          <div>
            <p className="label">High</p>
            <p className="value" style={{ color: '#ff9800' }}>{riskCounts['HIGH'] || 0}</p>
          </div>
          <div className="stat-icon">
            <div className="icon-bg" style={{ color: '#ff9800' }}>
              <svg viewBox="0 0 24 24" className="stat-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card stat-medium">
          <div>
            <p className="label">Medium</p>
            <p className="value" style={{ color: '#1976d2' }}>{riskCounts['MEDIUM'] || 0}</p>
          </div>
          <div className="stat-icon">
            <div className="icon-bg" style={{ color: '#1976d2' }}>
              <svg viewBox="0 0 24 24" className="stat-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card stat-low">
          <div>
            <p className="label">Low</p>
            <p className="value" style={{ color: '#0b8f36' }}>{riskCounts['LOW'] || 0}</p>
          </div>
          <div className="stat-icon">
            <div className="icon-bg" style={{ color: '#0b8f36' }}>
              <svg viewBox="0 0 24 24" className="stat-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14.5l-4.5-4.5 1.41-1.41L11 13.67l5.09-5.09L17.5 10l-6.5 6.5z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="risk-content-section">
        <div className="chart-card chart-right" style={{ maxWidth: '100%' }}>
          <div className="card-header">
            <h3>Existing Risks</h3>
          </div>
          <div className="card-body">
            <div className="monitor-table" style={{ width: '100%' }}>
              <div className="card-header">
                <p className="muted">All recorded risks</p>
              </div>
              <div style={{ padding: 0 }}>
                <div className="table-wrapper">
                  <table className="risk-table">
                    <thead>
                        <tr>
                          <th>Asset</th>
                          <th>Vulnerability</th>
                          <th>Impact</th>
                          <th>Threats</th>
                          <th>Severity</th>
                          <th>Likelihood</th>
                          <th>Risk Level</th>
                          <th className="actions-col" aria-label="Actions">⋯</th>
                        </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="no-records">No risk records yet</td>
                        </tr>
                        ) : records.map(r => (
                            <tr key={r.id}>
                              <td>{r.asset}</td>
                              <td>{r.vulnerability}</td>
                              <td>{r.impact}</td>
                              <td>{r.threats}</td>
                              <td>{r.severity}</td>
                              <td>{r.likelihood}</td>
                              <td><span className={`risk-badge risk-${(r.riskLevel||'UNKNOWN').toLowerCase()}`}>{r.riskLevel}</span></td>
                              <td>
                                <button className="delete-icon-btn" onClick={() => handleDelete(r.id)} title="Delete risk">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z" fill="currentColor"/>
                                  </svg>
                                </button>
                              </td>
                            </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Risk</h3>
            <div className="modal-body">
              <form onSubmit={handleAddRisk} autoComplete="off">
                <div className="form-field full-width">
                  <label>Asset</label>
                  <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                    {Array.isArray(assets) && assets.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <h4 className="form-group-title">Risk Description</h4>
                  
                  <div className="form-field full-width">
                    <label>Vulnerability</label>
                    <p className="field-help-text">Describe the problem in plain language. Example: No firewall on server, backups not taken, outdated software, or slow page causing delays.</p>
                    <textarea value={vuln} onChange={(e) => setVuln(e.target.value)} placeholder="Describe the vulnerability in plain language..." rows={3} />
                  </div>

                  <div className="form-field">
                    <label>Impact</label>
                    <p className="field-help-text">Describe the effect on systems, data, operations, or people. Example: System and data breach or slow response to outages.</p>
                    <textarea value={impact} onChange={(e) => setImpact(e.target.value)} placeholder="Describe the impact..." rows={3} />
                  </div>

                  <div className="form-field">
                    <label>Threats</label>
                    <p className="field-help-text">List likely threat actors or causes. Example: External hackers, phishing, insider mistakes, or maintenance lapses.</p>
                    <textarea value={threats} onChange={(e) => setThreats(e.target.value)} placeholder="Describe the threats..." rows={3} />
                  </div>
                </div>

                <div className="form-field">
                  <label>Severity</label>
                  <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-field">
                  <label>Likelihood</label>
                  <select value={likelihood} onChange={(e) => setLikelihood(e.target.value)}>
                    {LIKELIHOOD_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit">Add Risk</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className={`toast-notification ${toastType}`} role="status" aria-live="polite">
          <div className="toast-icon">{toastType === 'success' ? '✓' : '!'}</div>
          <div className="toast-message">{toast}</div>
        </div>
      )}
      <DeleteConfirmModal open={deleteModalOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} risk={records.find(r => r.id === deleteTargetId)} password={deletePassword} setPassword={setDeletePassword} />
    </div>
  );
}

function StatCard({ label, count, color }) {
  return (
    <div className="stat-card">
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value" style={{ color }}>{count}</p>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ open, onClose, onConfirm, risk, password, setPassword }) {
  if (!open) return null;
  const name = risk ? `${risk.vulnerability}` : '';
  return (
    <div className="modal modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h3>Delete Risk</h3>
        <div className="warning-row">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="url(#warnGradient)"/>
            <path d="M16 10v8M16 22v1" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="warnGradient" x1="2" y1="2" x2="30" y2="30">
                <stop offset="0%" stopColor="#ff9800"/>
                <stop offset="100%" stopColor="#ff6b00"/>
              </linearGradient>
            </defs>
          </svg>
          <p>Are you sure you want to delete <strong style={{ color: '#e53935' }}>{name}</strong>? This action cannot be undone.</p>
        </div>
        <div className="form-row">
          <label>Enter password to confirm:</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
          />
        </div>
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}