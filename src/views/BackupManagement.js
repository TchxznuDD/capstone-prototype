import React, { useRef, useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import './BackupManagement.css';
import { ReactComponent as DatabaseIcon } from '../assets/Database.svg';
import { ReactComponent as BakaupIcon } from '../assets/Bakaup.svg';
import BakaupGlyph from '../assets/BakaupGlyph.svg';
import { ReactComponent as CheckIcon } from '../assets/CheckNew.svg';

export default function BackupManagement() {
  const stats = {
    storageUsed: '12.4 GB',
    totalBackups: 5,
    successRate: '80%'
  };

  const [historyList, setHistoryList] = useState([
    { id: 1, date: '2025-11-05', type: 'automatic', size: '2.4 GB' },
    { id: 2, date: '2025-11-04', type: 'automatic', size: '2.3 GB' },
    { id: 3, date: '2025-11-03', type: 'automatic', size: '2.3 GB' },
    { id: 4, date: '2025-11-02', type: 'manual', size: '2.2 GB' },
  ]);
  const [deleting, setDeleting] = useState(null); // now just an item id
  const [deletePassword, setDeletePassword] = useState('');
  const [notification, setNotification] = useState(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloading, setDownloading] = useState(null);

  function showNotification(message, type = 'success') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

  function handleDownload(backupDate, backupSize) {
    setDownloading({ date: backupDate, size: backupSize });
  }

  function confirmDownload() {
    setIsDownloading(true);
    setDownloading(null);
    setTimeout(() => {
      setIsDownloading(false);
      showNotification('Backup downloaded successfully!', 'success');
    }, 2000);
  }

  function cancelDownload() {
    setDownloading(null);
    showNotification('Download cancelled.', 'info');
  }

  function handleStartBackup() {
    setIsBackingUp(true);
    setBackupProgress(0);

    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          showNotification('Backup Successfully Completed!', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }

  // Groups by year -> month only. Each entry is rendered once, individually —
  // no nested per-day bucket, since dates are already unique per entry.
  function groupByYearMonth(items) {
    const map = {};
    items
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(it => {
        const d = new Date(it.date);
        const year = d.getFullYear();
        const month = d.toLocaleString(undefined, { month: 'long' });
        map[year] = map[year] || {};
        map[year][month] = map[year][month] || [];
        map[year][month].push(it);
      });
    return map;
  }

  const historyRef = useRef(null);

  const [autoEnabled, setAutoEnabled] = useState(true);
  const [frequency, setFrequency] = useState('Daily');
  const [backupTime, setBackupTime] = useState('17:00');

  function handleSaveSettings() {
    showNotification('Backup settings saved successfully!', 'success');
  }

  function handleViewBackups() {
    if (historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function confirmDelete() {
    if (deletePassword !== 'admin') {
      showNotification('Incorrect password. Please try again.', 'error');
      return;
    }
    setHistoryList(prev => prev.filter(i => i.id !== deleting));
    showNotification('Backup deleted successfully!', 'success');
    setDeleting(null);
    setDeletePassword('');
  }

  return (
    <div className="dashboard-root backup-root">
      <Header active="backup" />

      <div className="hero-row">
        <div className="page-hero header-text">
          <div className="hero-text">
            <h2>Backup Management</h2>
            <p>Configure automatic backups and manage your data protection settings</p>
          </div>
        </div>
      </div>

      <main className="backup-grid">
        <section className="metrics-cards">
          <div className="metric-card storage">
            <p className="label">Storage Used</p>
            <p className="value">{stats.storageUsed}</p>
            <div className="note">▲ 24.8%</div>
            <div className="stat-icon"><div className="icon-bg storage"><DatabaseIcon className="stat-svg" aria-hidden="true" /></div></div>
          </div>

          <div className="metric-card total">
            <p className="label">Total Backups</p>
            <p className="value">{stats.totalBackups}</p>
            <div className="note green">▲ Active</div>
            <div className="stat-icon"><div className="icon-bg"><BakaupIcon className="stat-svg" aria-hidden="true" /></div></div>
          </div>

          <div className="metric-card">
            <p className="label">Success Rate</p>
            <p className="value">{stats.successRate}</p>
            <div className="note">▲ Excellent</div>
            <div className="stat-icon"><div className="icon-bg green"><CheckIcon className="stat-svg" aria-hidden="true" /></div></div>
          </div>
        </section>

        <section className="left-panel">
          <div className="card manual-backup">
            <div className="manual-top">
              <div className="manual-thumb"><img src={BakaupGlyph} alt="backup" /></div>
              <div className="manual-info">
                <div className="manual-head">
                  <h3>Manual Backup</h3>
                  <p className="muted">Create an immediate backup of your data</p>
                  <div className="muted small">Last manual backup: 2025-11-02 · 2.2 GB</div>
                </div>
              </div>
            </div>
            <div className="manual-inline">
              <div className="mini-progress" aria-hidden>
                <div className="mini-fill" style={{ width: `${backupProgress}%` }}></div>
              </div>
              <div className="mini-label muted small">{backupProgress}%</div>
            </div>

            <div className="manual-actions">
              <div className="backup-progress">
                <div className="muted small">{isBackingUp ? 'Backup in progress...' : 'No recent successful backups'}</div>
              </div>
              <div className="actions">
                <button className="btn primary" onClick={handleStartBackup} disabled={isBackingUp}>
                  {isBackingUp ? 'Backing up...' : 'Start Backup'}
                </button>
                <button className="btn secondary" onClick={handleViewBackups}>View Backups</button>
              </div>
            </div>
          </div>

          <div className="card auto-settings stacked-format">
            <div className="auto-top">
              <div className="auto-thumb"><img src={BakaupGlyph} alt="automatic backup" /></div>
              <div className="auto-head">
                <h3>Automatic Backup Settings</h3>
                <p className="muted">Configure scheduled automatic backups</p>
              </div>
            </div>

            <div className="auto-inline">
              <div className="auto-inline-label muted">Automatic Backup</div>
              <label className="toggle-switch">
                <input type="checkbox" checked={autoEnabled} onChange={e => setAutoEnabled(e.target.checked)} />
                <span className="slider" aria-hidden></span>
              </label>
            </div>

            <div className="form-row stack">
              <label>Backup Frequency</label>
              <div className="control">
                <FrequencyDropdown value={frequency} onChange={setFrequency} disabled={!autoEnabled} />
              </div>
            </div>

            <div className="form-row stack">
              <label>Backup Time</label>
              <div className="control">
                <input type="time" value={backupTime} onChange={e => setBackupTime(e.target.value)} disabled={!autoEnabled} />
              </div>
            </div>

            <div className="save-row">
              <button className="btn primary" onClick={handleSaveSettings} disabled={!autoEnabled} aria-disabled={!autoEnabled}>Save Settings</button>
            </div>
          </div>

          <div className="card history">
            <h3>Backup History</h3>
            <div className="history-list">
              {(() => {
                const grouped = groupByYearMonth(historyList);
                const years = Object.keys(grouped).sort((a, b) => b - a);

                if (years.length === 0) {
                  return <div className="muted small">No backups yet.</div>;
                }

                return years.map(year => (
                  <div key={year} className="history-year">
                    <div className="year-label">{year}</div>
                    {Object.keys(grouped[year]).map(month => (
                      <div key={month} className="history-month">
                        <div className="month-label">{month}</div>
                        <div className="history-items">
                          {grouped[year][month].map(item => {
                            const d = new Date(item.date);
                            const label = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
                            return (
                              <div key={item.id} className="history-item">
                                <div className="hi-left">
                                  <div className={`status-dot ${item.type}`}></div>
                                  <div>
                                    <div className="hi-date">{label}</div>
                                    <div className="hi-tags">
                                      <div className={`type-pill ${item.type}`}>{item.type}</div>
                                      <div className="muted small">{item.size}</div>
                                    </div>
                                  </div>
                                </div>

                                <div className="hi-right">
                                  <div className="hi-actions">
                                    <button className="btn danger" onClick={() => { setDeleting(item.id); setDeletePassword(''); }}>Delete</button>
                                    <button
                                      className="btn primary"
                                      onClick={() => handleDownload(`${label}, ${year}`, item.size)}
                                      disabled={isDownloading}
                                    >
                                      {isDownloading ? 'Downloading...' : 'Download'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ));
              })()}

              <div ref={historyRef}></div>
              <div className="history-controls">
                {historyList.length > 3 && (
                  <Link to="/backup/history?scroll=top" className="btn secondary" state={{ scrollToTop: true }}>View more</Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {downloading && (
        <div className="modal modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h3>Download Backup</h3>
            <div className="warning-row">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="url(#restoreGradientBackup)" />
                <path d="M16 10v8M16 22v1" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="restoreGradientBackup" x1="2" y1="2" x2="30" y2="30">
                    <stop offset="0%" stopColor="#ff7b00" />
                    <stop offset="100%" stopColor="#ff4b00" />
                  </linearGradient>
                </defs>
              </svg>
              <p>Are you sure you want to download the backup from <strong>{downloading.date}</strong> ({downloading.size})? A copy will be saved to your device.</p>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={cancelDownload}>Cancel</button>
              <button className="btn primary" onClick={confirmDownload}>Download</button>
            </div>
          </div>
        </div>
      )}

      {deleting !== null && (
        <div className="modal modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h3>Delete Backup</h3>
            <div className="warning-row">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="url(#warnGradient)" />
                <path d="M16 10v8M16 22v1" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="warnGradient" x1="2" y1="2" x2="30" y2="30">
                    <stop offset="0%" stopColor="#ff9800" />
                    <stop offset="100%" stopColor="#ff6b00" />
                  </linearGradient>
                </defs>
              </svg>
              <p>Are you sure you want to permanently delete this backup? This action cannot be undone.</p>
            </div>
            <div className="form-row">
              <label>Enter password to confirm:</label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={() => { setDeleting(null); setDeletePassword(''); }}>Cancel</button>
              <button className="btn primary" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <div className="toast-icon">
            {notification.type === 'success' ? '✓' : '!'}
          </div>
          <div className="toast-message">{notification.message}</div>
        </div>
      )}
    </div>
  );
}

function FrequencyDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function handleSelect(v) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div className="dropdown" ref={ref} style={{ opacity: disabled ? 0.6 : 1 }}>
      <button className="dropdown-toggle" onClick={() => !disabled && setOpen(s => !s)} aria-haspopup="true" aria-expanded={open} disabled={disabled}>
        {value} ▾
      </button>
      <ul className={`dropdown-menu ${open ? 'open' : ''}`} role="menu" aria-hidden={!open}>
        <li role="menuitem"><button className="link-like" onClick={() => handleSelect('Daily')}>Daily</button></li>
        <li role="menuitem"><button className="link-like" onClick={() => handleSelect('Weekly')}>Weekly</button></li>
        <li role="menuitem"><button className="link-like" onClick={() => handleSelect('Monthly')}>Monthly</button></li>
      </ul>
    </div>
  );
}