import React, { useState, useRef, useEffect } from "react";
import { getAdminPassword } from "../utils/auth";
import { getDarkMode, applyDarkMode } from "../utils/theme";
import "./Computer.css";
import Header from "../components/Header";
import computerIcon from "../assets/computer.svg";
import { ReactComponent as Signal3Icon } from "../assets/signal3.svg";
import { ReactComponent as OfflineIcon } from "../assets/offline.svg";
// header is provided by shared component

export default function Dashboard() {
  const stats = { total: 12, online: 9, offline: 3 };
  const initialBuildings = [
    {
      id: 'rev',
      name: 'Revenue Building',
      subtitle: 'Main Office Complex',
      online: 4,
      offline: 0,
      stations: [
        { id:'rev-01', name:'Revenue Workstation 1', host:'REV-01', ip:'192.168.1.10', uptime:'45h 23m', status:'online', lastSeen:'Active now'},
        { id:'rev-02', name:'Revenue Workstation 2', host:'REV-02', ip:'192.168.1.11', uptime:'45h 20m', status:'online', lastSeen:'Active now'},
        { id:'rev-03', name:'Revenue Workstation 3', host:'REV-03', ip:'192.168.1.12', uptime:'38h 15m', status:'online', lastSeen:'Active now'},
        { id:'rev-04', name:'Revenue Workstation 4', host:'REV-04', ip:'192.168.1.13', uptime:'52h 30m', status:'online', lastSeen:'Active now'}
      ]
    },
    {
      id: 'vawc',
      name: 'VAWC Building',
      subtitle: 'Community Center',
      online: 1,
      offline: 2,
      stations: [
        { id:'vawc-01', name:'VAWC Station', host:'VAWC-01', ip:'192.168.1.20', uptime:'0h 0m', status:'offline', lastSeen:'2 hours ago'},
        { id:'vawc-02', name:'VAWC Workstation 2', host:'VAWC-02', ip:'192.168.1.21', uptime:'24h 45m', status:'online', lastSeen:'Active now'},
        { id:'vawc-03', name:'VAWC Workstation 3', host:'VAWC-03', ip:'192.168.1.22', uptime:'0h 0m', status:'offline', lastSeen:'5 hours ago'}
      ]
    },
    {
      id: 'leg',
      name: 'Legislative Building',
      subtitle: 'Government Complex',
      online: 4,
      offline: 1,
      stations: [
        { id:'leg-01', name:'Legislative Workstation 1', host:'LEG-01', ip:'192.168.1.30', uptime:'72h 15m', status:'online', lastSeen:'Active now' },
        { id:'leg-02', name:'Legislative Workstation 2', host:'LEG-02', ip:'192.168.1.31', uptime:'72h 10m', status:'online', lastSeen:'Active now' },
        { id:'leg-03', name:'Legislative Workstation 3', host:'LEG-03', ip:'192.168.1.32', uptime:'48h 05m', status:'online', lastSeen:'Active now' },
        { id:'leg-04', name:'Legislative Workstation 4', host:'LEG-04', ip:'192.168.1.33', uptime:'0h 0m', status:'offline', lastSeen:'30 minutes ago' },
        { id:'leg-05', name:'Legislative Workstation 5', host:'LEG-05', ip:'192.168.1.34', uptime:'36h 42m', status:'online', lastSeen:'Active now' }
      ]
    }
  ];

  const [buildings, setBuildings] = useState(initialBuildings);

  // Notification state
  const [notification, setNotification] = useState(null);

  // Re-apply dark mode when page loads (in case coming from login)
  useEffect(() => {
    applyDarkMode(getDarkMode());
  }, []);

  function showNotification(message, type = 'success') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

  // centralized edit selection modal state
  const [selectEditOpen, setSelectEditOpen] = useState(false);
  const [selectBuilding, setSelectBuilding] = useState('');
  const [selectStationId, setSelectStationId] = useState('');

  // modal state for add / edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [modalBuilding, setModalBuilding] = useState('');
  const [modalStationId, setModalStationId] = useState(null);
  const [form, setForm] = useState({ name: '', host:'', ip:'', uptime:'0h 0m' });

  function openAddModal() {
    setModalMode('add');
    setModalBuilding(buildings[0]?.id || '');
    setForm({ name:'', host:'', ip:'', uptime:'0h 0m' });
    setModalOpen(true);
  }

  function openEditModal(buildingId, station) {
    setModalMode('edit');
    setModalBuilding(buildingId);
    setModalStationId(station.id);
    setForm({ name: station.name, host: station.host, ip: station.ip, uptime: station.uptime || '0h 0m' });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalStationId(null);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  // Validate IP address format (XXX.XXX.XXX.XXX with each octet 0-255)
  function isValidIP(ip) {
    if (!ip || !ip.trim()) return false;
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      if (!/^\d{1,3}$/.test(part)) return false;
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  function handleSaveModal() {
    if (modalMode === 'add') {
      // Validate required fields
      if (!form.name || !form.name.trim()) {
        showNotification('Please enter a computer name', 'error');
        return;
      }
      if (!form.host || !form.host.trim()) {
        showNotification('Please enter a computer ID', 'error');
        return;
      }
      if (!form.ip || !form.ip.trim()) {
        showNotification('Please enter an IP address', 'error');
        return;
      }
      if (!isValidIP(form.ip)) {
        showNotification('Invalid IP format. Use XXX.XXX.XXX.XXX (0-255)', 'error');
        return;
      }

      setBuildings(prev => prev.map(b => {
        if (b.id !== modalBuilding) return b;
        const nextId = `${b.id}-${String(b.stations.length + 1).padStart(2,'0')}`;
        const derivedStatus = (form.ip || '').trim() ? 'online' : 'offline';
        const newStation = { id: nextId, name: form.name || 'New PC', host: (form.host || '').toUpperCase(), ip: form.ip || '', uptime: form.uptime || '0h 0m', status: derivedStatus, lastSeen: derivedStatus === 'offline' ? 'Unknown' : 'Active now' };
        const updatedStations = [...b.stations, newStation];
        const onlineCount = updatedStations.filter(s => s.status === 'online').length;
        const offlineCount = updatedStations.length - onlineCount;
        return { ...b, stations: updatedStations, online: onlineCount, offline: offlineCount };
      }));
      showNotification('Computer added successfully!', 'success');
    } else if (modalMode === 'edit') {
      // Validate required fields for edit
      if (!form.name || !form.name.trim()) {
        showNotification('Please enter a computer name', 'error');
        return;
      }
      if (!form.host || !form.host.trim()) {
        showNotification('Please enter a computer ID', 'error');
        return;
      }
      if (!form.ip || !form.ip.trim()) {
        showNotification('Please enter an IP address', 'error');
        return;
      }
      if (!isValidIP(form.ip)) {
        showNotification('Invalid IP format. Use XXX.XXX.XXX.XXX (0-255)', 'error');
        return;
      }

      // Check if any changes were made
      const building = buildings.find(b => b.id === modalBuilding);
      const currentStation = building?.stations.find(s => s.id === modalStationId);
      if (currentStation) {
        const noChanges = 
          currentStation.name === form.name &&
          currentStation.host === form.host &&
          currentStation.ip === form.ip &&
          currentStation.uptime === form.uptime;
        
        if (noChanges) {
          showNotification('No changes were made', 'info');
          return;
        }
      }

      setBuildings(prev => prev.map(b => {
        if (b.id !== modalBuilding) return b;
        const updatedStations = b.stations.map(s => {
          if (s.id !== modalStationId) return s;
          const derivedStatus = (form.ip || '').trim() ? 'online' : 'offline';
          return { ...s, name: form.name, host: form.host, ip: form.ip, uptime: form.uptime, status: derivedStatus, lastSeen: derivedStatus === 'offline' ? 'Unknown' : 'Active now' };
        });
        const onlineCount = updatedStations.filter(s => s.status === 'online').length;
        const offlineCount = updatedStations.length - onlineCount;
        return { ...b, stations: updatedStations, online: onlineCount, offline: offlineCount };
      }));
      showNotification('Computer updated successfully!', 'success');
    }
    setModalOpen(false);
  }

  // --- Add Building modal state and handlers ---
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [buildingForm, setBuildingForm] = useState({ name: '', subtitle: '' });

  function openAddBuildingModal() {
    setBuildingForm({ name: '', subtitle: '' });
    setBuildingModalOpen(true);
  }

  function closeBuildingModal() {
    setBuildingModalOpen(false);
  }

  function handleSaveBuilding() {
    // Validate building name
    if (!buildingForm.name || !buildingForm.name.trim()) {
      showNotification('Please enter a building name', 'error');
      return;
    }

    const name = (buildingForm.name || 'New Building').trim();
    const subtitle = (buildingForm.subtitle || '').trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `${slug || 'building'}-${String(Date.now()).slice(-4)}`;
    const newBuilding = { id, name, subtitle, online: 0, offline: 0, stations: [] };
    setBuildings(prev => [...prev, newBuilding]);
    // make the new building selected for immediate Add PC actions
    setModalBuilding(id);
    showNotification('Building added successfully!', 'success');
    setBuildingModalOpen(false);
  }

  // --- Centralized Edit selection modal handlers ---
  function openSelectEditModal() {
    if (buildings.length) {
      setSelectBuilding(buildings[0].id);
      setSelectStationId(buildings[0].stations[0]?.id || '');
    } else {
      setSelectBuilding('');
      setSelectStationId('');
    }
    setSelectEditOpen(true);
  }

  function closeSelectEditModal() {
    setSelectEditOpen(false);
  }

  function handleConfirmSelectEdit() {
    if (!selectBuilding) {
      showNotification('Please select a building', 'error');
      return;
    }
    if (!selectStationId) {
      showNotification('Please select a workstation', 'error');
      return;
    }
    const b = buildings.find(x => x.id === selectBuilding);
    const station = b?.stations.find(s => s.id === selectStationId);
    if (station) {
      openEditModal(selectBuilding, station);
    }
    setSelectEditOpen(false);
  }

  return (
    <div className="dashboard-root">
      <Header active="computers" />

      <div className="hero-row">
        <div className="page-hero">
          <div className="hero-text">
            <h2>Computer Status Monitor</h2>
            <p>Real-time monitoring of all computers across barangay buildings</p>
          </div>
        </div>

        <div className="external-refresh">
          <button className="refresh-btn">Refresh ↻</button>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card stat-total">
          <div>
            <p className="label">Total Computers</p>
            <p className="value">{stats.total}</p>
          </div>
          <div className="stat-icon"><div className="icon-bg"><img src={computerIcon} alt="Total computers" /></div></div>
        </div>

        <div className="stat-card stat-online">
          <div>
            <p className="label">Online</p>
            <p className="value green">{stats.online}</p>
          </div>
          <div className="stat-icon"><div className="icon-bg"><Signal3Icon className="stat-svg" aria-hidden="true" /></div></div>
        </div>

        <div className="stat-card stat-offline">
          <div>
            <p className="label">Offline</p>
            <p className="value red">{stats.offline}</p>
          </div>
          <div className="stat-icon"><div className="icon-bg"><OfflineIcon className="stat-svg" aria-hidden="true" /></div></div>
        </div>
      </section>

      <main className="buildings-col">
        {buildings.map(b => (
          <article key={b.id} className="building">
            <div className="building-head">
              <div className="building-title-row">
                <span className="location-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" fill="#ffe3c1"/>
                    <path d="M12 7a5 5 0 0 1 5 5c0 3.1-3.2 6.2-4.3 7.2a1 1 0 0 1-1.4 0C10.2 18.2 7 15.1 7 12a5 5 0 0 1 5-5zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="#ff9800"/>
                  </svg>
                </span>
                <p className="building-title">{b.name}</p>
              </div>
              <div className="building-status">
                <span className="building-sub">{b.subtitle}</span>
                <div className="status-pill-group">
                  <span className="status-pill online"><span className="label">Online</span> <span className="count">{b.online}</span></span>
                  <span className="status-pill offline"><span className="label">Offline</span> <span className="count">{b.offline}</span></span>
                </div>
              </div>
            </div>

            <div className="cards-row">
              {b.stations.map(s => (
                <div key={s.id} className={`station-card ${s.status === 'offline' ? 'off' : ''}`}>
                  <div className="row">
                    <div className="station-left">
                      <div className="station-thumb">
                        <img src={computerIcon} alt="computer" />
                      </div>
                      <div>
                        <p className="device-title">{s.name}</p>
                        <p className="device-meta">{s.host}</p>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <p className={`pill ${s.status}`}>{s.status.toUpperCase()}</p>
                    </div>
                  </div>

                  <p className="device-ip">IP Address: <strong>{s.ip}</strong></p>
                  <p className="device-uptime">Uptime: {s.uptime}</p>
                  <p className={s.status === 'offline' ? 'last-seen' : 'device-meta'}>Last Seen: {s.lastSeen}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </main>

      <AddEditModal open={modalOpen} mode={modalMode} buildings={buildings} buildingId={modalBuilding} setBuildingId={setModalBuilding} onClose={() => setModalOpen(false)} onSave={handleSaveModal} form={form} setForm={setForm} />
      <AddBuildingModal open={buildingModalOpen} onClose={closeBuildingModal} onSave={handleSaveBuilding} form={buildingForm} setForm={setBuildingForm} />
      <SelectEditModal open={selectEditOpen} onClose={closeSelectEditModal} buildings={buildings} buildingId={selectBuilding} setBuildingId={setSelectBuilding} stationId={selectStationId} setStationId={setSelectStationId} onConfirm={handleConfirmSelectEdit} />

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

function AddEditModal({ open, mode, buildings, buildingId, setBuildingId, onClose, onSave, form, setForm }) {
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h3>{mode === 'add' ? 'Add Computer' : 'Edit Computer'}</h3>
        <div className="form-row">
          <label>Building</label>
          <select name="building" value={buildingId} onChange={e => setBuildingId(e.target.value)} disabled={mode === 'edit'}>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Computer Name</label>
          <input name="name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
        </div>
        <div className="form-row">
          <label>Computer ID</label>
          <input name="host" value={form.host} onChange={e => setForm(f => ({...f, host: e.target.value}))} />
        </div>
        <div className="form-row">
          <label>IPv4 Address</label>
          <input name="ip" value={form.ip} onChange={e => setForm(f => ({...f, ip: e.target.value}))} />
        </div>
        {/* Status is assigned automatically based on IP presence; user cannot set it manually. */}
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onSave}>{mode === 'add' ? 'Add' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

function AddBuildingModal({ open, onClose, onSave, form, setForm }) {
  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h3>Add Building</h3>
        <div className="form-row">
          <label>Name</label>
          <input name="name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
        </div>
        <div className="form-row">
          <label>Location Type (Small Description)</label>
          <input name="subtitle" value={form.subtitle} onChange={e => setForm(f => ({...f, subtitle: e.target.value}))} />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onSave}>Add Building</button>
        </div>
      </div>
    </div>
  );
}

function SelectEditModal({ open, onClose, buildings, buildingId, setBuildingId, stationId, setStationId, onConfirm }) {
  if (!open) return null;
  const currentBuilding = buildings.find(b => b.id === buildingId) || buildings[0] || null;
  const stations = currentBuilding ? currentBuilding.stations : [];
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h3>Select Workstation to Edit</h3>
        <div className="form-row">
          <label>Building</label>
          <select value={buildingId} onChange={e => { setBuildingId(e.target.value); const b = buildings.find(x=>x.id===e.target.value); setStationId(b?.stations[0]?.id || ''); }}>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Workstation</label>
          <select value={stationId} onChange={e => setStationId(e.target.value)} disabled={!stations.length}>
            {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.host})</option>)}
          </select>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onConfirm} disabled={!stationId}>Edit Selected</button>
        </div>
      </div>
    </div>
  );
}

function AdminDropdown() {
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
}
