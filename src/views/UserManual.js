import React, { useState } from 'react';
import Header from '../components/Header';
import './UserManual.css';

export default function UserManual() {
  const [notification, setNotification] = useState(null);
  const [downloadCount, setDownloadCount] = useState(0);
  const [easterEgg, setEasterEgg] = useState(false);

  function showNotification(message, type = 'success') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

  function handleDownload() {
    const newCount = downloadCount + 1;
    setDownloadCount(newCount);

    if (newCount === 1) {
      showNotification('User Manual downloaded successfully!', 'success');
    } else if (newCount === 3) {
      showNotification('Download initiated. Version 1.0.0 (Current)', 'info');
    } else if (newCount === 5) {
      showNotification('Tip: User Manual is also available offline after first download', 'info');
      setEasterEgg(true);
    } else if (newCount === 10) {
      showNotification('Frequent Access Detected: Consider bookmarking this page', 'info');
    } else if (newCount > 10) {
      const messages = [
        'Download complete. File cached for offline access',
        'Latest version: 1.0.0 (No updates available)',
        'Tip: Press Ctrl+D to bookmark this page for quick access',
        'Download #' + newCount + ' completed successfully'
      ];
      showNotification(messages[Math.floor(Math.random() * messages.length)], 'info');
    } else {
      showNotification('User Manual downloaded!', 'success');
    }

    // Simulate download (no actual file)
    console.log('Mock download initiated - Download count:', newCount);
  }

  function getSectionIcon(iconType) {
    switch(iconType) {
      case 'rocket':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55l1.33 1.33zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83L11.17 17zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81l-1.33-1.33zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12A2.996 2.996 0 0 1 9 18z"/>
          </svg>
        );
      case 'computer':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
          </svg>
        );
      case 'server':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          </svg>
        );
      case 'firewall':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
        );
      case 'backup':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
        );
      case 'settings':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        );
      case 'security':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        );
      case 'troubleshoot':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        );
    }
  }

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      iconType: 'rocket',
      items: [
        'First Time Setup',
        'Basic Navigation',
        'Dashboard Overview',
        'Understanding the Interface',
        'Header Navigation Menu',
        'Notification System',
        'Refresh Functionality',
        'Header links auto-scroll to top after navigation'
      ]
    },
    {
      id: 'computer-monitoring',
      title: 'Computer Monitoring',
      iconType: 'computer',
      items: [
        'Viewing Computer Status by Building',
        'Adding New Computers to Buildings',
        'Editing Computer Details',
        'Deleting Computers (Admin: password required)',
        'Building Management (Revenue, VAWC, Legislative)',
        'Real-time Status Indicators (Online/Offline)',
        'IP Address Management',
        'Hostname and Uptime Tracking',
        'Last Seen Information',
        'Edit Selection Modal'
      ]
    },
    {
      id: 'server-status',
      title: 'Infrastructure Status',
      iconType: 'server',
      items: [
        'Two-panels (1×2) layout: Server + MikroTik Router',
        'Server Metrics: CPU, Memory, Disk, Net In/Out',
        'Server Specs and System Info (Kernel, Arch, Processes)',
        'Router Metrics: CPU, Memory, WAN/LAN throughput',
        'Router System Info: Model, Firmware, Temperature, DHCP leases',
        
      ]
    },
    {
      id: 'firewall',
      title: 'Firewall Monitoring',
      iconType: 'firewall',
      items: [
        'Understanding Firewall Rules',
        'Viewing Active Rules',
        'Monitoring Blocked Connections',
        'Protocol Types (TCP, UDP, ICMP, ALL)',
        'Action Types (ALLOW, BLOCK)',
        'Traffic and Bandwidth Charts',
        'Protocol Distribution Analysis',
        'Blocked Attempts by Reason',
        'Real-time Statistics Dashboard',
        'Manual Refresh Functionality'
      ]
    },
    {
      id: 'backup',
      title: 'Backup Management',
      iconType: 'backup',
      items: [
        'Starting Manual Backups',
        'Viewing Backup History (Grouped by Date)',
        'Restoring from Backup',
        'Automatic Backup Settings',
        'Backup Schedule Configuration (Daily/Weekly/Monthly)',
        'Time Selection for Auto Backups',
        'Storage Usage Statistics',
        'Backup Progress Indicator',
        'Success Rate Tracking',
        'Expandable History View'
      ]
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      iconType: 'settings',
      items: [
        'Changing Password',
        'Notification Preferences (apply immediately — no Save button)',
        'Auto-refresh Settings (apply immediately)',
        'Display Customization (Dark Mode toggle)',
        'Date/time pickers optimized for dark mode (white calendar icon)',
        'System Preferences',
        'Toast Notifications',
        'Modal Dialogs',
        'Form Validation'
      ]
    },
    {
      id: 'security',
      title: 'Security Best Practices',
      iconType: 'security',
      items: [
        'User Access Control',
        'Firewall Rule Guidelines',
        'Backup Security',
        'IP Address Validation (0-255 per octet)',
        'Protected Operations',
        'Session Management'
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      iconType: 'troubleshoot',
      items: [
        'Common Error Messages',
        'Connection Issues',
        'Backup Failures',
        'IP Address Validation Errors',
        'Browser Compatibility',
        'Chart Rendering Issues',
        'Modal Dialog Problems',
        'Form Submission Errors',
        'Refresh and Reload Solutions'
      ]
    }
  ];

  return (
    <div className="dashboard-root usermanual-root">
      <Header active="user-manual" />

      <div className="hero-row">
        <div className="page-hero">
          <div className="hero-text">
            <h2>User Manual</h2>
            <p>Complete guide to using the Barangay Fatima Network Monitoring Dashboard</p>
          </div>
        </div>
      </div>

      <main>
        {/* Download Section */}
        <section className="card download-card">
          <div className="download-header">
            <div className="manual-icon">
              <svg viewBox="0 0 24 24" fill="none" className="manual-svg">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="url(#manualGradient)"/>
                <path d="M14 2v6h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 13h8M8 17h8M8 9h2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="manualGradient" x1="4" y1="2" x2="20" y2="22">
                    <stop offset="0%" stopColor="#ff7b00"/>
                    <stop offset="100%" stopColor="#ff4b00"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="download-info">
              <h3>Barangay Fatima Dashboard User Manual</h3>
              <p className="manual-meta">Version 2.0.0 • PDF Format • Last updated: November 2025</p>
              <div className="manual-stats">
                <span className="stat-badge">185 Pages</span>
                <span className="stat-badge">Comprehensive Guide</span>
                <span className="stat-badge">Updated Features</span>
              </div>
            </div>
          </div>
          <button className="btn primary download-btn" onClick={handleDownload}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v13m0 0l-4-4m4 4l4-4M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download PDF
          </button>
        </section>

        {easterEgg && (
          <section className="card easter-egg">
            <div className="egg-content">
              <span className="egg-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/>
                </svg>
              </span>
              <div>
                <h4>Pro Tip</h4>
                <p>The User Manual is cached locally after first download. You can access it offline anytime.</p>
              </div>
            </div>
          </section>
        )}

        {/* Table of Contents */}
        <section className="card toc-card">
          <h3 className="section-title">
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px', verticalAlign: 'middle', marginRight: '8px'}}>
              <path d="M19 2H9c-1.1 0-2 .9-2 2v5.5c0 .83-.67 1.5-1.5 1.5S4 10.33 4 9.5V4c0-.55-.45-1-1-1s-1 .45-1 1v5.5c0 1.93 1.57 3.5 3.5 3.5 1.93 0 3.5-1.57 3.5-3.5V4h10v16H9v-6H7v8h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            Table of Contents
          </h3>
          <div className="toc-grid">
            {sections.map(section => (
              <div key={section.id} className="toc-section">
                <div className="toc-header">
                  <span className="toc-icon">{getSectionIcon(section.iconType)}</span>
                  <h4>{section.title}</h4>
                </div>
                <ul className="toc-items">
                  {section.items.map((item, idx) => (
                    <li key={idx}>
                      <span className="bullet">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Reference */}
        <section className="card quick-ref-card">
          <h3 className="section-title">
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px', verticalAlign: 'middle', marginRight: '8px'}}>
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            Quick Reference
          </h3>
          <div className="quick-ref-grid">
            <div className="ref-item">
              <div className="ref-icon orange">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.65 10C11.7 7.31 8.9 5.5 5.77 6.12c-2.29.46-4.15 2.29-4.63 4.58C.32 14.57 3.26 18 7 18c2.61 0 4.83-1.67 5.65-4H17v2c0 1.1.9 2 2 2s2-.9 2-2v-2c1.1 0 2-.9 2-2s-.9-2-2-2h-8.35zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              </div>
              <h4>Admin Password (Default)</h4>
              <p className="ref-value">junior</p>
              <p className="ref-desc">Password of junior staff</p>
            </div>
            <div className="ref-item">
              <div className="ref-icon blue">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <h4>IP Format</h4>
              <p className="ref-value">XXX.XXX.XXX.XXX</p>
              <p className="ref-desc">Each octet: 0-255</p>
            </div>
            <div className="ref-item">
              <div className="ref-icon green">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
              </div>
              <h4>Auto-Refresh</h4>
              <p className="ref-value">30 seconds</p>
              <p className="ref-desc">Default refresh interval</p>
            </div>

          </div>
        </section>

        {/* Support Section */}
        <section className="card support-card">
          <h3 className="section-title">
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px', verticalAlign: 'middle', marginRight: '8px'}}>
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
            Need Help?
          </h3>
          <div className="support-content">
            <div className="support-item">
              <span className="support-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </span>
              <div>
                <h4>Email Support</h4>
                <p>support@barangayfatima.local</p>
              </div>
            </div>
            <div className="support-item">
              <span className="support-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </span>
              <div>
                <h4>Phone Support</h4>
                <p>+63 (02) 1234-5678</p>
              </div>
            </div>
            <div className="support-item">
              <span className="support-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                </svg>
              </span>
              <div>
                <h4>Office Hours</h4>
                <p>Monday - Friday, 8:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </section>

        </main>

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
