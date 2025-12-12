import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './FirewallMonitor.css';
import { getDarkMode, applyDarkMode } from '../utils/theme';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Mock data for MikroTik RouterOS firewall rules (stateful firewall)
const mockFirewallRules = [
  { id: 1, ruleName: 'Accept Established/Related', sourceIP: '0.0.0.0/0', destIP: '0.0.0.0/0', port: '*', protocol: 'TCP', action: 'ALLOW', status: 'Active', chain: 'input', connection: 'established,related' },
  { id: 2, ruleName: 'Drop Invalid Connections', sourceIP: '0.0.0.0/0', destIP: '0.0.0.0/0', port: '*', protocol: 'ALL', action: 'BLOCK', status: 'Active', chain: 'input', connection: 'invalid' },
  { id: 3, ruleName: 'Allow SSH from LAN', sourceIP: '192.168.1.0/24', destIP: '192.168.1.1', port: '22', protocol: 'TCP', action: 'ALLOW', status: 'Active', chain: 'input', connection: 'new' },
  { id: 4, ruleName: 'Allow Winbox from LAN', sourceIP: '192.168.1.0/24', destIP: '192.168.1.1', port: '8291', protocol: 'TCP', action: 'ALLOW', status: 'Active', chain: 'input', connection: 'new' },
  { id: 5, ruleName: 'Allow DNS', sourceIP: '192.168.1.0/24', destIP: '0.0.0.0/0', port: '53', protocol: 'UDP', action: 'ALLOW', status: 'Active', chain: 'forward', connection: 'new' },
  { id: 6, ruleName: 'Allow HTTP/HTTPS', sourceIP: '192.168.1.0/24', destIP: '0.0.0.0/0', port: '80,443', protocol: 'TCP', action: 'ALLOW', status: 'Active', chain: 'forward', connection: 'new' },
  { id: 7, ruleName: 'FastTrack Established', sourceIP: '0.0.0.0/0', destIP: '0.0.0.0/0', port: '*', protocol: 'ALL', action: 'ALLOW', status: 'Active', chain: 'forward', connection: 'established,related' },
  { id: 8, ruleName: 'Drop Invalid Forward', sourceIP: '0.0.0.0/0', destIP: '0.0.0.0/0', port: '*', protocol: 'ALL', action: 'BLOCK', status: 'Active', chain: 'forward', connection: 'invalid' },
  { id: 9, ruleName: 'Block Telnet from WAN', sourceIP: '0.0.0.0/0', destIP: '192.168.1.1', port: '23', protocol: 'TCP', action: 'BLOCK', status: 'Active', chain: 'input', connection: 'new' },
  { id: 10, ruleName: 'NAT Masquerade', sourceIP: '192.168.1.0/24', destIP: '0.0.0.0/0', port: '*', protocol: 'ALL', action: 'ALLOW', status: 'Active', chain: 'srcnat', connection: 'new' },
];

// Mock data for MikroTik blocked connection attempts (stateful firewall drops)
const mockBlockedConnections = [
  { id: 1, time: '2025-12-12 14:35:22', sourceIP: '203.0.113.45', destIP: '192.168.1.1', port: '8291', protocol: 'TCP', reason: 'Invalid connection state' },
  { id: 2, time: '2025-12-12 14:32:18', sourceIP: '185.220.101.23', destIP: '192.168.1.1', port: '23', protocol: 'TCP', reason: 'Telnet blocked from WAN' },
  { id: 3, time: '2025-12-12 14:28:45', sourceIP: '45.142.212.61', destIP: '192.168.1.1', port: '22', protocol: 'TCP', reason: 'SSH from untrusted source' },
  { id: 4, time: '2025-12-12 14:25:33', sourceIP: '91.203.5.165', destIP: '192.168.1.5', port: '3389', protocol: 'TCP', reason: 'Invalid connection state' },
  { id: 5, time: '2025-12-12 14:22:11', sourceIP: '158.69.133.20', destIP: '192.168.1.1', port: '80', protocol: 'TCP', reason: 'HTTP to router blocked' },
  { id: 6, time: '2025-12-12 14:18:59', sourceIP: '203.0.113.45', destIP: '192.168.1.1', port: '8291', protocol: 'TCP', reason: 'Winbox from WAN blocked' },
  { id: 7, time: '2025-12-12 14:15:42', sourceIP: '89.248.165.89', destIP: '192.168.1.1', port: '23', protocol: 'TCP', reason: 'Telnet blocked from WAN' },
  { id: 8, time: '2025-12-12 14:12:27', sourceIP: '103.253.145.12', destIP: '192.168.1.10', port: '445', protocol: 'TCP', reason: 'Invalid connection state' },
  { id: 9, time: '2025-12-12 14:08:13', sourceIP: '45.142.212.61', destIP: '192.168.1.15', port: '135', protocol: 'TCP', reason: 'Invalid connection state' },
  { id: 10, time: '2025-12-12 14:05:55', sourceIP: '185.220.101.23', destIP: '192.168.1.1', port: '22', protocol: 'TCP', reason: 'SSH from untrusted source' },
  { id: 11, time: '2025-12-12 14:02:38', sourceIP: '91.203.5.165', destIP: '192.168.1.20', port: '3389', protocol: 'TCP', reason: 'Invalid connection state' },
  { id: 12, time: '2025-12-12 13:58:21', sourceIP: '158.69.133.20', destIP: '192.168.1.1', port: '8291', protocol: 'TCP', reason: 'Winbox from WAN blocked' },
  { id: 13, time: '2025-12-12 13:55:09', sourceIP: '103.253.145.12', destIP: '192.168.1.1', port: '22', protocol: 'TCP', reason: 'SSH from untrusted source' },
  { id: 14, time: '2025-12-12 13:51:44', sourceIP: '89.248.165.89', destIP: '192.168.1.8', port: '139', protocol: 'TCP', reason: 'Invalid connection state' },
  { id: 15, time: '2025-12-12 13:48:22', sourceIP: '203.0.113.45', destIP: '192.168.1.1', port: '443', protocol: 'TCP', reason: 'HTTPS to router blocked' },
];

// Mock bandwidth usage data (in Mbps over last 24 hours)
const mockBandwidthData = {
  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  datasets: [
    {
      label: 'Inbound Traffic',
      data: [12, 8, 15, 22, 45, 68, 85, 92, 78, 65, 48, 28],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
    },
    {
      label: 'Outbound Traffic',
      data: [8, 6, 10, 18, 38, 55, 72, 80, 68, 52, 38, 22],
      borderColor: 'rgb(255, 123, 0)',
      backgroundColor: 'rgba(255, 123, 0, 0.2)',
      tension: 0.4,
    },
  ],
};

// Mock protocol distribution data
const mockProtocolData = {
  labels: ['TCP', 'UDP', 'ICMP', 'HTTP/HTTPS', 'Other'],
  datasets: [
    {
      label: 'Traffic by Protocol',
      data: [45, 25, 10, 15, 5],
      backgroundColor: [
        'rgba(255, 123, 0, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
      borderColor: [
        'rgb(255, 123, 0)',
        'rgb(54, 162, 235)',
        'rgb(255, 206, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
      ],
      borderWidth: 2,
    },
  ],
};

// Mock blocked attempts by reason (MikroTik stateful firewall)
const mockBlockedByReason = {
  labels: ['Invalid Connection', 'WAN Access Blocked', 'SSH from Untrusted', 'Telnet Blocked', 'Winbox from WAN'],
  datasets: [
    {
      label: 'Blocked Attempts',
      data: [52, 38, 28, 22, 15],
      backgroundColor: 'rgba(214, 40, 40, 0.8)',
      borderColor: 'rgb(214, 40, 40)',
      borderWidth: 1,
    },
  ],
};

/**
 * FirewallMonitor Component
 * Read-only dashboard for monitoring firewall activity
 * Displays active rules, blocked connections, and bandwidth statistics
 */
export default function FirewallMonitor() {
  // State for firewall rules and blocked connections
  const [rules, setRules] = useState(mockFirewallRules);
  const [blockedConnections, setBlockedConnections] = useState(mockBlockedConnections);
  
  // State for filters
  const [filters, setFilters] = useState({
    sourceIP: '',
    destIP: '',
    dateFrom: '',
    dateTo: '',
  });

  // State for notification toast
  const [notification, setNotification] = useState(null);

  // State for chart refresh counter
  const [chartKey, setChartKey] = useState(0);

  // Re-apply dark mode and configure charts for dark mode
  useEffect(() => {
    applyDarkMode(getDarkMode());
    updateChartColors();
  }, []);

  // Function to update chart colors based on dark mode
  const updateChartColors = () => {
    const isDark = document.documentElement.classList.contains('dark-mode');
    if (isDark) {
      ChartJS.defaults.color = '#ffffff';
      ChartJS.defaults.borderColor = '#3d3d3d';
      ChartJS.defaults.plugins.legend.labels.color = '#ffffff';
      ChartJS.defaults.scale.ticks.color = '#ffffff';
    } else {
      ChartJS.defaults.color = '#666';
      ChartJS.defaults.borderColor = '#e0e0e0';
      ChartJS.defaults.plugins.legend.labels.color = '#666';
      ChartJS.defaults.scale.ticks.color = '#666';
    }
    setChartKey(prev => prev + 1); // Force chart re-render
  };

  /**
   * Show notification toast message
   * @param {string} message - Message to display
   * @param {string} type - Type of notification (success, error, info)
   */
  function showNotification(message, type = 'success') {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }

  /**
   * Handle refresh button click
   * Simulates reloading mock data
   */
  function handleRefresh() {
    // In a real app, this would fetch fresh data from API
    setRules([...mockFirewallRules]);
    setBlockedConnections([...mockBlockedConnections]);
    setChartKey(prev => prev + 1);
    showNotification('Dashboard refreshed successfully!', 'success');
  }

  /**
   * Handle filter input changes
   * @param {Event} e - Input change event
   */
  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }

  /**
   * Filter blocked connections based on current filter values
   * @returns {Array} Filtered blocked connections
   */
  function getFilteredBlockedConnections() {
    return blockedConnections.filter(conn => {
      // Filter by source IP
      if (filters.sourceIP && !conn.sourceIP.includes(filters.sourceIP)) {
        return false;
      }
      
      // Filter by destination IP
      if (filters.destIP && !conn.destIP.includes(filters.destIP)) {
        return false;
      }
      
      // Filter by date range
      if (filters.dateFrom || filters.dateTo) {
        const connDate = new Date(conn.time);
        if (filters.dateFrom && connDate < new Date(filters.dateFrom)) {
          return false;
        }
        if (filters.dateTo && connDate > new Date(filters.dateTo + ' 23:59:59')) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Clear all filters
   */
  function handleClearFilters() {
    setFilters({
      sourceIP: '',
      destIP: '',
      dateFrom: '',
      dateTo: '',
    });
    showNotification('Filters cleared', 'info');
  }

  // Calculate statistics
  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.status === 'Active').length,
    allowRules: rules.filter(r => r.action === 'ALLOW').length,
    blockRules: rules.filter(r => r.action === 'BLOCK').length,
    blockedToday: blockedConnections.length,
    uniqueAttackers: new Set(blockedConnections.map(c => c.sourceIP)).size,
  };

  const filteredConnections = getFilteredBlockedConnections();

  return (
    <div className="dashboard-root firewall-monitor-root">
      <Header active="firewall-monitor" />

      {/* Page Header */}
      <div className="hero-row">
        <div className="page-hero">
          <div className="hero-text">
            <h2>Firewall Monitor</h2>
            <p>Real-time monitoring of firewall activity and blocked threats</p>
          </div>
        </div>

        <div className="external-refresh">
          <button className="refresh-btn" onClick={handleRefresh}>Refresh ↻</button>
        </div>
      </div>

      <main>
        {/* Statistics Overview */}
        <section className="stats-grid monitor-stats">
          <div className="stat-card stat-active">
            <div>
              <p className="label">Active Rules</p>
              <p className="value">{stats.activeRules}</p>
              <p className="subtext">of {stats.totalRules} total</p>
            </div>
            <div className="stat-icon">
              <div className="icon-bg">
                <svg viewBox="0 0 24 24" fill="#ff7b00" className="stat-svg">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card stat-blocked">
            <div>
              <p className="label">Blocked Today</p>
              <p className="value">{stats.blockedToday}</p>
              <p className="subtext">connection attempts</p>
            </div>
            <div className="stat-icon">
              <div className="icon-bg">
                <svg viewBox="0 0 24 24" fill="#d62828" className="stat-svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card stat-attackers">
            <div>
              <p className="label">Unique Attackers</p>
              <p className="value">{stats.uniqueAttackers}</p>
              <p className="subtext">distinct IP addresses</p>
            </div>
            <div className="stat-icon">
              <div className="icon-bg">
                <svg viewBox="0 0 24 24" fill="#ff9800" className="stat-svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card stat-rules">
            <div>
              <p className="label">Allow / Block Rules</p>
              <p className="value"><span className="green">{stats.allowRules}</span> <span className="separator">/</span> <span className="red">{stats.blockRules}</span></p>
              <p className="subtext">configured rules</p>
            </div>
            <div className="stat-icon">
              <div className="icon-bg">
                <svg viewBox="0 0 24 24" fill="#0b8f36" className="stat-svg">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Charts - Mixed Grid Layout */}
        <section className="charts-grid-mixed">
          <div className="card chart-card">
            <div className="card-header">
              <h3>Bandwidth Usage (24h)</h3>
              <p className="muted small">Network traffic over the last 24 hours</p>
            </div>
            <div className="card-body chart-compact">
              <Line
                key={`bandwidth-${chartKey}`}
                data={mockBandwidthData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  aspectRatio: 1.3,
                  animation: {
                    duration: 750
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 10,
                        padding: 8,
                        font: {
                          size: 10
                        }
                      }
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Mbps',
                        font: {
                          size: 10
                        }
                      },
                      ticks: {
                        font: {
                          size: 9
                        }
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: 9
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="card chart-card">
            <div className="card-header">
              <h3>Protocol Distribution</h3>
              <p className="muted small">Traffic breakdown by protocol type</p>
            </div>
            <div className="card-body chart-doughnut chart-compact">
              <Doughnut
                key={`protocol-${chartKey}`}
                data={mockProtocolData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  aspectRatio: 1.3,
                  animation: {
                    duration: 750
                  },
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 10,
                        padding: 6,
                        font: {
                          size: 10
                        }
                      }
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="card chart-card chart-full-width">
            <div className="card-header">
              <h3>Top Blocked Reasons</h3>
              <p className="muted small">Most common blocking causes</p>
            </div>
            <div className="card-body chart-compact">
              <Bar
                key={`blocked-${chartKey}`}
                data={mockBlockedByReason}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  aspectRatio: 1.3,
                  indexAxis: 'y',
                  animation: {
                    duration: 750
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Attempts',
                        font: {
                          size: 10
                        }
                      },
                      ticks: {
                        font: {
                          size: 9
                        }
                      }
                    },
                    y: {
                      ticks: {
                        font: {
                          size: 9
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Active Firewall Rules Table */}
        <section className="card monitor-table">
          <div className="card-header">
            <h3>Active Firewall Rules</h3>
            <span className="badge">{rules.length} rules</span>
          </div>
          <div className="table-responsive">
            <table className="monitor-data-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Source IP</th>
                  <th>Destination IP</th>
                  <th>Port</th>
                  <th>Protocol</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.id}>
                    <td className="rule-name-col">{rule.ruleName}</td>
                    <td><code>{rule.sourceIP}</code></td>
                    <td><code>{rule.destIP}</code></td>
                    <td><code>{rule.port}</code></td>
                    <td><span className={`protocol-badge ${rule.protocol.toLowerCase()}`}>{rule.protocol}</span></td>
                    <td><span className={`action-badge ${rule.action.toLowerCase()}`}>{rule.action}</span></td>
                    <td><span className="status-badge active">{rule.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Filters Section */}
        <section className="card filter-card">
          <div className="card-header">
            <h3>Connection Filters</h3>
            <button className="btn secondary small" onClick={handleClearFilters}>Clear Filters</button>
          </div>
          <div className="card-body">
            <div className="filter-grid">
              <div className="filter-group">
                <label>Source IP</label>
                <input 
                  type="text" 
                  name="sourceIP"
                  value={filters.sourceIP}
                  onChange={handleFilterChange}
                  placeholder="e.g., 203.0.113.45"
                />
              </div>
              <div className="filter-group">
                <label>Destination IP</label>
                <input 
                  type="text" 
                  name="destIP"
                  value={filters.destIP}
                  onChange={handleFilterChange}
                  placeholder="e.g., 192.168.1.5"
                />
              </div>
              <div className="filter-group">
                <label>Date From</label>
                <input 
                  type="date" 
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="filter-group">
                <label>Date To</label>
                <input 
                  type="date" 
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <div className="filter-results">
              Showing <strong>{filteredConnections.length}</strong> of <strong>{blockedConnections.length}</strong> blocked connections
            </div>
          </div>
        </section>

        {/* Blocked Connections Table */}
        <section className="card monitor-table">
          <div className="card-header">
            <h3>Blocked Connection Attempts</h3>
            <span className="badge red">{filteredConnections.length} blocked</span>
          </div>
          <div className="table-responsive">
            <table className="monitor-data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Source IP</th>
                  <th>Destination IP</th>
                  <th>Port</th>
                  <th>Protocol</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {filteredConnections.length > 0 ? (
                  filteredConnections.map(conn => (
                    <tr key={conn.id}>
                      <td className="time-col">{conn.time}</td>
                      <td><code className="ip-blocked">{conn.sourceIP}</code></td>
                      <td><code>{conn.destIP}</code></td>
                      <td><code>{conn.port}</code></td>
                      <td><span className={`protocol-badge ${conn.protocol.toLowerCase()}`}>{conn.protocol}</span></td>
                      <td className="reason-col">{conn.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No blocked connections match the current filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Notification Toast */}
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
