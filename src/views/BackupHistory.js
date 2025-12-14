import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './BackupManagement.css';
import './BackupHistory.css';

function groupByYearMonth(items) {
  const map = {};
  items.forEach(it => {
    const d = new Date(it.date);
    const year = d.getFullYear();
    const month = d.toLocaleString(undefined, { month: 'long' });
    const day = d.getDate();
    map[year] = map[year] || {};
    map[year][month] = map[year][month] || {};
    map[year][month][day] = map[year][month][day] || [];
    map[year][month][day].push(it);
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
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoring, setRestoring] = useState(null);

  function showNotification(message, type = 'success') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

  function handleRestore(backupDate, backupSize) {
    setRestoring({ date: backupDate, size: backupSize });
  }

  function confirmRestore() {
    setIsRestoring(true);
    setRestoring(null);
    setTimeout(() => {
      setIsRestoring(false);
      showNotification('Backup restored successfully!', 'success');
    }, 2000);
  }

  function cancelRestore() {
    setRestoring(null);
    showNotification('Restore operation cancelled.', 'info');
  }

  const location = useLocation();

  const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
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

  // Close calendar when clicking outside or pressing Escape
  useEffect(() => {
    function onDocClick(e) {
      if (!showCalendar) return;
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
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

  // Filter items by selected date if any, then group
  const activeItems = selectedDate ? items.filter(it => (new Date(it.date).toISOString().slice(0,10)) === selectedDate) : items;
  const grouped = groupByYearMonth(activeItems);

  function removeDay(year, month, day) {
    // remove all items that match year/month/day
    setItems(prev => prev.filter(it => {
      const d = new Date(it.date);
      return !(d.getFullYear() === Number(year) && d.toLocaleString(undefined, { month: 'long' }) === month && d.getDate() === Number(day));
    }));
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
            {/* date button toggles calendar; clicking again closes it */}
            <button className="btn" onClick={(e) => { e.preventDefault(); setShowCalendar(s => !s); if (!showCalendar && selectedDate) { const parts = selectedDate.split('-').map(Number); setCalendarView(new Date(parts[0], parts[1]-1, 1)); } }}>
              {selectedDate ? selectedDate : 'Choose date'}
            </button>
            {selectedDate && <button className="btn" onClick={() => { setSelectedDate(''); setShowCalendar(false); }}>Clear</button>}

            {showCalendar && (
              <div className="calendar-popup" role="dialog" aria-modal="false">
                <div className="calendar-header">
                  <button className="cal-nav" onClick={() => setCalendarView(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>&lt;</button>
                  <div className="cal-month">{calendarView.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
                  <button className="cal-nav" onClick={() => setCalendarView(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>&gt;</button>
                </div>
                <div className="calendar-grid">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="cal-weekday">{d}</div>)}
                  {(() => {
                    const blanks = new Array(new Date(calendarView.getFullYear(), calendarView.getMonth(), 1).getDay()).fill(null);
                    const days = [];
                    const dim = new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 0).getDate();
                    for (let i = 1; i <= dim; i++) days.push(i);
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
        {Object.keys(grouped).sort((a,b) => b - a).map(year => (
          <section key={year} className="card" style={{marginBottom:18}}>
            <h3 style={{marginBottom:12}}>{year}</h3>
            {Object.keys(grouped[year]).map(month => (
              <div key={month} style={{marginBottom:12}}>
                <h4 style={{margin:'6px 0', color:'#444'}}>{month}</h4>
                <div style={{display:'grid', gap:8}}>
                  {Object.keys(grouped[year][month]).sort((a,b)=>b-a).map(day => {
                      const itemsForDay = grouped[year][month][day];
                      const rep = itemsForDay.find(i => i.type === 'automatic') || itemsForDay[0];
                      const repDate = new Date(rep.date);
                      const repTime = rep.type === 'automatic' ? new Date(repDate).setHours(17,0,0,0) : repDate;
                      const displayTime = new Date(repTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div key={day} className="history-item" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                          <div style={{flex:1, display:'flex', flexDirection:'column', gap:8}}>
                            <div style={{display:'flex', gap:12, alignItems:'center'}}>
                              <div className={`status-dot ${itemsForDay[0].type}`}></div>
                              <div>
                                <div className="hi-date">{month} {day}</div>
                                <div className="muted small">{itemsForDay.length} backup(s)</div>
                                <div className="muted small hi-time">{displayTime}</div>
                              </div>
                            </div>

                            <div className="day-list">
                              {itemsForDay.map(it => {
                                const d = new Date(it.date);
                                const timeVal = it.type === 'automatic' ? new Date(d).setHours(17,0,0,0) : d;
                                const timeStr = new Date(timeVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return (
                                  <div key={it.id} className="day-entry">
                                    <div className="entry-time muted small">{timeStr}</div>
                                    <div className={`type-pill ${it.type}`}>{it.type}</div>
                                    <div className="muted small">{it.size}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{width:160, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6}}>
                            <div className="muted small">{itemsForDay.map(it => it.size).join(', ')}</div>

                            <div style={{marginTop:'auto'}}>
                              <div className="hi-actions" style={{display:'flex', gap:8}}>
                                <button className="btn primary" onClick={() => handleRestore(`${month} ${day}, ${year}`, itemsForDay[0].size)} disabled={isRestoring}>
                                  {isRestoring ? 'Restoring...' : 'Restore'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>
      {restoring && (
        <div className="modal modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h3>Restore Backup</h3>
            <div className="warning-row">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="url(#restoreGradient)"/>
                <path d="M16 10v8M16 22v1" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="restoreGradient" x1="2" y1="2" x2="30" y2="30">
                    <stop offset="0%" stopColor="#ff7b00"/>
                    <stop offset="100%" stopColor="#ff4b00"/>
                  </linearGradient>
                </defs>
              </svg>
              <p>Are you sure you want to restore the backup from <strong>{restoring.date}</strong> ({restoring.size})? This will replace your current data.</p>
            </div>
            <div className="form-actions">
              <button className="btn" onClick={cancelRestore}>Cancel</button>
              <button className="btn primary" onClick={confirmRestore}>Restore</button>
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
