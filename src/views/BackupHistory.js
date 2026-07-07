import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './BackupManagement.css';
import './BackupHistory.css';

// Groups by year -> month only. Items within a month are rendered individually
// (sorted newest first), so multiple backups on the same day are just multiple
// rows rather than a nested "day bucket" duplicating the same info twice.
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

export default function BackupHistory() {
  // Mock data only (stateful so delete can update)
  const [items, setItems] = useState([
    { id: 1, date: '2025-11-05T02:00:00', size: '2.4 GB', type: 'automatic' },
    { id: 2, date: '2025-11-04T02:00:00', size: '2.3 GB', type: 'automatic' },
    { id: 3, date: '2025-10-28T14:30:00', size: '2.1 GB', type: 'manual' },
    { id: 4, date: '2025-09-12T06:15:00', size: '1.9 GB', type: 'automatic' },
    { id: 5, date: '2024-12-31T23:59:00', size: '3.0 GB', type: 'manual' },
    { id: 6, date: '2024-11-15T11:00:00', size: '2.7 GB', type: 'automatic' },
  ]);

  const [notification, setNotification] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
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

  const [deleting, setDeleting] = useState(null); // item id being deleted
  const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD from input
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const location = useLocation();
  const pickerRef = useRef(null);

  // If navigated here with state or ?scroll=top, scroll the main container into view
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || '');
      const wantsScroll = (location && location.state && location.state.scrollToTop) || params.get('scroll') === 'top';
      if (wantsScroll) {
        // small delay to allow route render / layout before scrolling
          setTimeout(() => {
            const mainEl = document.querySelector('main.backup-grid') || document.querySelector('main');
            const headerEl = document.querySelector('.app-header') || document.querySelector('.header');
            const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
            const extraOffset = 150; // increased offset so content scrolls further up under header
            if (mainEl) {
              const top = mainEl.getBoundingClientRect().top + window.scrollY - headerH - extraOffset;
              window.scrollTo({ top: Math.max(0, Math.floor(top)), behavior: 'smooth' });
            } else {
              window.scrollTo({ top: Math.max(0, headerH + extraOffset * -1), behavior: 'smooth' });
            }
          }, 80);
      }
    } catch (e) {
      // fallback to a simple scroll
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 80);
    }
  }, [location]);

  // If a date is selected, filter items to that single date, else show all
  function isoDateString(d) {
    const dt = new Date(d);
    return dt.toISOString().slice(0,10);
  }

  const activeItems = selectedDate ? items.filter(it => isoDateString(it.date) === selectedDate) : items;
  const grouped = groupByYearMonth(activeItems);

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function daysInMonth(d) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  function monthLabel(d) {
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }

  function openCalendar() {
    setShowCalendar(true);
    // sync view to selected or today
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number);
      setCalendarView(new Date(parts[0], parts[1] - 1, 1));
    } else {
      const n = new Date();
      setCalendarView(new Date(n.getFullYear(), n.getMonth(), 1));
    }
  }

  // Close calendar when clicking outside or pressing Escape
  useEffect(() => {
    function onDocClick(e) {
      if (!showCalendar) return;
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target)) setShowCalendar(false);
    }
    function onKey(e) {
      if (e.key === 'Escape' && showCalendar) setShowCalendar(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showCalendar]);

  // Build sections either from grouped items or show no-results card
  const sections = (selectedDate && activeItems.length === 0)
    ? (
      <section className="card" key="no-results">
        <h3>No results</h3>
        <p>There are no backups for the selected date.</p>
      </section>
    )
    : (
      Object.keys(grouped).sort((a,b) => b - a).map(year => (
        <section key={year} className="card" style={{marginBottom:18}}>
          <h3 style={{marginBottom:12}}>{year}</h3>
          {Object.keys(grouped[year]).map(month => (
            <div key={month} style={{marginBottom:12}}>
              <h4 style={{margin:'6px 0', color:'#444'}}>{month}</h4>
              <div className="history-items">
                {grouped[year][month].map(item => {
                  const d = new Date(item.date);
                  const label = d.getDate();
                  return (
                    <div key={item.id} className="history-item">
                      <div className="hi-left">
                        <div className={`status-dot ${item.type}`}></div>
                        <div>
                          <div className="hi-date">{month} {label}</div>
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
                            onClick={() => handleDownload(`${month} ${label}, ${year}`, item.size)}
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
        </section>
      ))
    );

  function removeItem(id) {
    setItems(prev => prev.filter(it => it.id !== id));
  }

  return (
    <div className="dashboard-root backup-root backup-history">
      <Header active="backup" />

      <div className="hero-row">
        <div className="page-hero header-text">
          <div className="hero-text">
            <h2>Backup History</h2>
            <p>View your backups by year, month and day. This is a mock preview.</p>
          </div>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div className="date-picker" style={{display:'flex', alignItems:'center', gap:8, position:'relative'}} ref={pickerRef}>
              <button aria-label="Open calendar" className="btn" onClick={(e) => { e.preventDefault(); if (showCalendar) setShowCalendar(false); else openCalendar(); }}>{selectedDate ? selectedDate : 'Choose date'}</button>
              {selectedDate && <button className="btn" onClick={() => { setSelectedDate(''); setShowCalendar(false); }}>Clear</button>}

              {showCalendar && (
                <div className="calendar-popup" role="dialog" aria-modal="false">
                  <div className="calendar-header">
                    <button className="cal-nav" onClick={() => setCalendarView(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>&lt;</button>
                    <div className="cal-month">{monthLabel(calendarView)}</div>
                    <button className="cal-nav" onClick={() => setCalendarView(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>&gt;</button>
                  </div>
                  <div className="calendar-grid">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="cal-weekday">{d}</div>)}
                    {(() => {
                      const blanks = new Array(startOfMonth(calendarView).getDay()).fill(null);
                      const days = [];
                      for (let i = 1; i <= daysInMonth(calendarView); i++) days.push(i);
                      return blanks.concat(days).map((v, idx) => {
                        if (v === null) return <div key={'b'+idx} className="cal-day empty" />;
                        const year = calendarView.getFullYear();
                        const month = calendarView.getMonth() + 1;
                        const dd = v;
                        const iso = `${year}-${String(month).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
                        const isSelected = iso === selectedDate;
                        return (
                          <button key={iso} className={`cal-day${isSelected ? ' selected' : ''}`} onClick={() => { setSelectedDate(iso); setShowCalendar(false); }} aria-pressed={isSelected}>
                            {v}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

          <div className="external-refresh" style={{alignSelf: 'center'}}>
            <Link to="/backup" className="refresh-btn">← Back</Link>
          </div>
        </div>
      </div>

      <main className="backup-grid">
        {sections}
      </main>
      {downloading && (
        <div className="modal modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h3>Download Backup</h3>
            <div className="warning-row">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="url(#downloadGradientHistory)"/>
                <path d="M16 10v8M16 22v1" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="downloadGradientHistory" x1="2" y1="2" x2="30" y2="30">
                    <stop offset="0%" stopColor="#ff7b00"/>
                    <stop offset="100%" stopColor="#ff4b00"/>
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
                <circle cx="16" cy="16" r="14" fill="url(#warnGradientHistory)"/>
                <path d="M16 10v8M16 22v1" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="warnGradientHistory" x1="2" y1="2" x2="30" y2="30">
                    <stop offset="0%" stopColor="#ff9800"/>
                    <stop offset="100%" stopColor="#ff6b00"/>
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
              <button className="btn primary" onClick={() => { 
                if (deletePassword !== 'admin') {
                  showNotification('Incorrect password. Please try again.', 'error');
                  return;
                }
                removeItem(deleting); 
                showNotification('Backup deleted successfully!', 'success'); 
                setDeleting(null);
                setDeletePassword('');
              }}>Delete</button>
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