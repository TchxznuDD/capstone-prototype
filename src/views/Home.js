import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './Home.css';
import { mockRecords } from '../data/Matrix.js';
import computerIcon from '../assets/computer.svg';
import { ReactComponent as ServerIcon } from '../assets/ServerIcon.svg';
import { ReactComponent as RouterIcon } from '../assets/Router.svg';
import { ReactComponent as DatabaseIcon } from '../assets/Database.svg';

function SuccessIcon(props) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<circle cx="12" cy="12" r="9" fill="currentColor" />
			<path d="M7.9 12.3L10.7 15.1L16.2 9.6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function RiskIcon(props) {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d="M12 3L22 20H2L12 3Z" fill="currentColor" />
			<path d="M12 8.25V13.25" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
			<circle cx="12" cy="16.75" r="1.1" fill="#fff" />
		</svg>
	);
}

export default function Home() {
	const [summary, setSummary] = useState({ totalPCs: 12, pcsOnline: 9, serversOnline: 2, firewallOnline: true, backupsSuccessful: 42 });

	useEffect(() => {
		try {
			const remote = window.__dashboardData;
			if (remote && typeof remote === 'object') setSummary(s => ({ ...s, ...remote }));
		} catch (e) {}
	}, []);

	const counts = mockRecords.reduce((acc, r) => {
		const lvl = (r.riskLevel || 'UNKNOWN').toUpperCase();
		acc[lvl] = (acc[lvl] || 0) + 1;
		acc.total = (acc.total || 0) + 1;
		return acc;
	}, {});

	const extreme = counts.EXTREME || 0;
	const high = counts.HIGH || 0;
	const medium = counts.MEDIUM || 0;
	const low = counts.LOW || 0;

	const pcPercent = summary.totalPCs ? Math.round((summary.pcsOnline / summary.totalPCs) * 100) : 0;

	const router = { name: 'MikroTik RB750Gr3', subtitle: 'RouterOS v7.14 (hEX)', status: 'online', ip: '192.168.1.1', uptime: '31 days, 8 hours' };

	// Local toast notification for quick mock actions (Start Backup)
	const [notification, setNotification] = useState(null);

	function showNotification(message, type = 'success') {
		setNotification({ message, type });
		setTimeout(() => setNotification(null), 3800);
	}

	function startBackup() {
		showNotification('Backup started — preparing...', 'info');
		setTimeout(() => {
			showNotification('Backup completed successfully', 'success');
			setSummary(s => ({ ...s, backupsSuccessful: (s.backupsSuccessful || 0) + 1 }));
		}, 1400);
	}

	return (
		<div className="dashboard-root home-root">
			<Header active="home" />

			<main>
				<div className="hero-bleed">
					<div className="home-container">
						<div className="hero-row">
							<div className="page-hero header-text">
								<div className="hero-text">
									<h2>Overview</h2>
									<p>High-level summary — network, servers, firewall and backups at a glance.</p>
								</div>
							</div>
							<div className="header-actions">
								<button className="refresh-btn" onClick={() => window.location.reload()}>Refresh ↻</button>
							</div>
						</div>
					</div>
				</div>

				<div className="home-container">
				<section className="home-stats" aria-label="At a glance summary">
					<Link to="/computer" className="home-card-link">
						<article className="home-card">
							<div className="meta">
								<div className="label">Endpoints</div>
								<div className="value">{summary.totalPCs}</div>
								<div className="desc">Total endpoints monitored</div>
							</div>
							<div className="icon"><img src={computerIcon} alt="Computer icon" /></div>
						</article>
					</Link>

					<Link to="/computer" className="home-card-link">
						<article className="home-card">
							<div className="meta">
								<div className="label">PCs Online</div>
								<div className="value">{summary.pcsOnline}</div>
								<div className="desc">{pcPercent}% online</div>
								<div className="home-progress" aria-hidden><span style={{ width: `${pcPercent}%` }} /></div>
							</div>
							<div className="icon"><SuccessIcon className="home-card-svg check-icon" aria-hidden="true" /></div>
						</article>
					</Link>

					<Link to="/server-status" className="home-card-link">
						<article className="home-card">
							<div className="meta">
								<div className="label">Servers</div>
								<div className="value">{summary.serversOnline}</div>
								<div className="desc">Servers currently responding</div>
							</div>
							<div className="icon"><ServerIcon className="home-card-svg" aria-hidden="true" /></div>
						</article>
					</Link>

					<Link to="/firewall/monitor" className="home-card-link">
						<article className="home-card">
							<div className="meta">
								<div className="label">Firewall</div>
								<div className="value">{summary.firewallOnline ? 'Online' : 'Offline'}</div>
								<div className="desc">Gateway protection status</div>
							</div>
							<div className="icon"><RouterIcon className="home-card-svg" aria-hidden="true" /></div>
						</article>
					</Link>

					<Link to="/backup" className="home-card-link">
						<article className="home-card">
							<div className="meta">
								<div className="label">Backups</div>
								<div className="value">{summary.backupsSuccessful}</div>
								<div className="desc">Successful backups</div>
							</div>
							<div className="icon"><DatabaseIcon className="home-card-svg" aria-hidden="true" /></div>
						</article>
					</Link>

					<Link to="/risk-assessment" className="home-card-link">
						<article className="home-card">
							<div className="meta">
								<div className="label">Risk Items</div>
								<div className="value">{counts.total || 0}</div>
								<div className="home-badges">
									<span className="home-badge extreme">{extreme} EXT</span>
									<span className="home-badge high">{high} HIGH</span>
									<span className="home-badge medium">{medium} MED</span>
									<span className="home-badge low">{low} LOW</span>
								</div>
							</div>
							<div className="icon"><RiskIcon className="home-card-svg risk-icon" aria-hidden="true" /></div>
						</article>
					</Link>
				</section>

				<section className="home-feature">
					<div className="feature-grid">
						<div className="feature-left">
							<div className="mikrotik card">
								<h4>MikroTik Summary</h4>
								<div className="mikro-row">
									<div className="mikro-meta">
										<div className="mikro-name">{router.name}</div>
										<div className="mikro-sub">{router.subtitle} <span className={`server-badge ${router.status}`}>{router.status}</span></div>
										<div className="mikro-info">
											<div><strong>IP:</strong> {router.ip}</div>
											<div><strong>Uptime:</strong> {router.uptime}</div>
										</div>
												<div className="mikro-actions">
													<button className="action-btn" onClick={startBackup}>Run Backup</button>
													<Link to="/server-status" className="action-btn">Full Router</Link>
												</div>
									</div>
								</div>
							</div>
						</div>

						<div className="feature-right">
							<div className="stats-card card">
								<div className="stats-inner">
									<h4>Statistics Overview</h4>
									<div className="home-stats-list">
										<div className="home-stat-row"><div className="label">Extreme</div><div className="bar extreme"><span style={{ width: `${Math.round((extreme / Math.max(1, counts.total || 1)) * 100)}%` }} /></div><div className="home-stat-value">{extreme}</div></div>
										<div className="home-stat-row"><div className="label">High</div><div className="bar high"><span style={{ width: `${Math.round((high / Math.max(1, counts.total || 1)) * 100)}%` }} /></div><div className="home-stat-value">{high}</div></div>
										<div className="home-stat-row"><div className="label">Medium</div><div className="bar medium"><span style={{ width: `${Math.round((medium / Math.max(1, counts.total || 1)) * 100)}%` }} /></div><div className="home-stat-value">{medium}</div></div>
										<div className="home-stat-row"><div className="label">Low</div><div className="bar low"><span style={{ width: `${Math.round((low / Math.max(1, counts.total || 1)) * 100)}%` }} /></div><div className="home-stat-value">{low}</div></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="home-panels">
					<div className="panel card">
						<h4>Quick Actions</h4>
						<p className="muted">Common maintenance and response actions for the site.</p>
						<div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
							<button className="action-btn">Start Backup</button>
							<button className="action-btn">Schedule Maintenance</button>
							<Link to="/user-manual" className="action-btn">User Manual</Link>
							<Link to="/settings" className="action-btn">Settings</Link>
						</div>
						<div style={{ marginTop: 14 }}>
							<p className="muted">Recent alerts: <strong>{counts.total || 0}</strong></p>
						</div>
					</div>
				</section>
				</div>
			</main>

			{/* Toast notification (top-right corner) */}
			{notification && (
				<div className={`toast-notification ${notification.type}`} role="status" aria-live="polite">
					<div className="toast-icon">{notification.type === 'success' ? '✓' : '!'}</div>
					<div className="toast-message">{notification.message}</div>
				</div>
			)}
		</div>
	);
}
