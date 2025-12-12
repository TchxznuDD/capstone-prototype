import React from 'react';
import Header from '../components/Header';
import './Computer.css';
import './ServerStatus.css';
import { ReactComponent as ServerIcon } from '../assets/ServerIcon.svg';
import { ReactComponent as RouterIcon } from '../assets/Router.svg';

export default function ServerStatus() {
  const server = {
    name: 'Ubuntu-Server-01',
    subtitle: 'Ubuntu 22.04 LTS (Jammy Jellyfish)',
    status: 'online',
    ip: '192.168.1.5',
    uptime: '47 days, 12 hours',
    cpu: 23.5,
    memory: { usedGB: 38.2, totalGB: 64 },
    disk: { usedGB: 847, totalGB: 2000 },
    netIn: '156.3 MB/s',
    netOut: '89.7 MB/s',
    specs: {
      cpu: 'Intel Xeon E5-2680 v4',
      memory: '64 GB DDR4',
      storage: '2 TB NVMe SSD',
      network: '10 Gigabit Ethernet'
    },
    system: {
      kernel: '5.15.0-91-generic',
      arch: 'x86_64',
      virt: 'KVM',
      lastBoot: '2024-09-18 14:23:15',
      loadAvg: '2.34, 2.18, 2.05',
      processes: '287 running'
    }
  };

  const pct = (used, total) => Math.round((used / total) * 1000) / 10;

  // Mikrotik Router sample data
  const router = {
    name: 'MikroTik RB750Gr3',
    subtitle: 'RouterOS v7.14 (hEX)',
    status: 'online',
    ip: '192.168.1.1',
    uptime: '31 days, 8 hours',
    cpu: 19.2,
    memory: { usedMB: 84, totalMB: 256 },
    net: {
      wanIn: '42.8 MB/s',
      wanOut: '38.4 MB/s',
      lanIn: '112.5 MB/s',
      lanOut: '128.9 MB/s'
    },
    system: {
      model: 'RB750Gr3 (hEX)',
      firmware: '7.14 (stable)',
      temperature: '46°C',
      dhcpLeases: 58,
      activeConns: 1342
    }
  };

  // Render ServerIcon inline as a React component to avoid runtime img loading
  // and intermittent disappearance during dev/HMR cycles.

  return (
    <div className="dashboard-root server-status-root">
      <Header active="server-status" />

      <div className="hero-row">
        <div className="page-hero">
          <div className="hero-text">
            <h2>Infrastructure Status</h2>
            <p>Real-time monitoring: Server and MikroTik Router</p>
          </div>
        </div>

        <div className="external-refresh">
          <button className="refresh-btn">Refresh ↻</button>
        </div>
      </div>

      {/* stats cards removed for Server Status as requested */}

      <main className="buildings-col">
        {/* Server Section */}
        <article className="building">
          <header className="server-head">
              <div style={{display:'flex', alignItems:'center', gap:12}}>
              <span className="server-thumb station-thumb" aria-hidden="true">
                <ServerIcon className="server-svg" aria-hidden="true" />
              </span>
              <div>
                <h2 className="server-name">{server.name}</h2>
                <div className="server-sub">{server.subtitle} <span className={`server-badge ${server.status}`}>{server.status}</span></div>
              </div>
            </div>
            <div className="server-meta">
              <div>IP Address<br/><strong>{server.ip}</strong></div>
              <div>Uptime<br/><strong>{server.uptime}</strong></div>
            </div>
          </header>

          <section className="specs-grid">
            <div className="spec">
              <h4>Processor</h4>
              <p>{server.specs.cpu}</p>
            </div>
            <div className="spec">
              <h4>Memory</h4>
              <p>{server.specs.memory}</p>
            </div>
            <div className="spec">
              <h4>Storage</h4>
              <p>{server.specs.storage}</p>
            </div>
            <div className="spec">
              <h4>Network</h4>
              <p>{server.specs.network}</p>
            </div>
          </section>

          <section className="metrics">
            <h3>Performance Metrics</h3>
            <div className="metric">
              <div className="metric-row">
                <span>CPU Usage</span>
                <span className="metric-value">{server.cpu}%</span>
              </div>
              <div className="metric-bar"><div className="metric-fill cpu" style={{width:`${server.cpu}%`}}/></div>
            </div>

            <div className="metric">
              <div className="metric-row">
                <span>Memory Usage</span>
                <span className="metric-value">{server.memory.usedGB} GB / {server.memory.totalGB} GB ({pct(server.memory.usedGB, server.memory.totalGB)}%)</span>
              </div>
              <div className="metric-bar"><div className="metric-fill mem" style={{width:`${pct(server.memory.usedGB, server.memory.totalGB)}%`}}/></div>
            </div>

            <div className="metric">
              <div className="metric-row">
                <span>Disk Usage</span>
                <span className="metric-value">{server.disk.usedGB} GB / {server.disk.totalGB} GB ({pct(server.disk.usedGB, server.disk.totalGB)}%)</span>
              </div>
              <div className="metric-bar"><div className="metric-fill disk" style={{width:`${pct(server.disk.usedGB, server.disk.totalGB)}%`}}/></div>
            </div>

            <div className="network-row">
              <div className="net-box">
                <div className="net-label">Network In</div>
                <div className="net-value">{server.netIn}</div>
              </div>
              <div className="net-box">
                <div className="net-label">Network Out</div>
                <div className="net-value">{server.netOut}</div>
              </div>
            </div>
          </section>

          <section className="system-info">
            <h4>System Information</h4>
            <div className="info-grid">
              <div><strong>Kernel Version</strong><div>{server.system.kernel}</div></div>
              <div><strong>Architecture</strong><div>{server.system.arch}</div></div>
              <div><strong>Virtualization</strong><div>{server.system.virt}</div></div>
              <div><strong>Last Boot</strong><div>{server.system.lastBoot}</div></div>
              <div><strong>Load Average</strong><div>{server.system.loadAvg}</div></div>
              <div><strong>Processes</strong><div>{server.system.processes}</div></div>
            </div>
          </section>
        </article>

        {/* Router Section */}
        <article className="building">
          <header className="server-head">
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <span className="server-thumb station-thumb" aria-hidden="true">
                <RouterIcon className="server-svg" aria-hidden="true" />
              </span>
              <div>
                <h2 className="server-name">{router.name}</h2>
                <div className="server-sub">{router.subtitle} <span className={`server-badge ${router.status}`}>{router.status}</span></div>
              </div>
            </div>
            <div className="server-meta">
              <div>IP Address<br/><strong>{router.ip}</strong></div>
              <div>Uptime<br/><strong>{router.uptime}</strong></div>
            </div>
          </header>

          <section className="specs-grid">
            <div className="spec">
              <h4>Model</h4>
              <p>{router.system.model}</p>
            </div>
            <div className="spec">
              <h4>Firmware</h4>
              <p>{router.system.firmware}</p>
            </div>
            <div className="spec">
              <h4>Temperature</h4>
              <p>{router.system.temperature}</p>
            </div>
            <div className="spec">
              <h4>DHCP Leases</h4>
              <p>{router.system.dhcpLeases} active</p>
            </div>
          </section>

          <section className="metrics">
            <h3>Performance & Throughput</h3>
            <div className="metric">
              <div className="metric-row">
                <span>CPU Usage</span>
                <span className="metric-value">{router.cpu}%</span>
              </div>
              <div className="metric-bar"><div className="metric-fill cpu" style={{width:`${router.cpu}%`}}/></div>
            </div>

            <div className="metric">
              <div className="metric-row">
                <span>Memory Usage</span>
                <span className="metric-value">{router.memory.usedMB} MB / {router.memory.totalMB} MB ({pct(router.memory.usedMB, router.memory.totalMB)}%)</span>
              </div>
              <div className="metric-bar"><div className="metric-fill mem" style={{width:`${pct(router.memory.usedMB, router.memory.totalMB)}%`}}/></div>
            </div>

            <div className="network-row">
              <div className="net-box">
                <div className="net-label">WAN In</div>
                <div className="net-value">{router.net.wanIn}</div>
              </div>
              <div className="net-box">
                <div className="net-label">WAN Out</div>
                <div className="net-value">{router.net.wanOut}</div>
              </div>
            </div>
            <div className="network-row">
              <div className="net-box">
                <div className="net-label">LAN In</div>
                <div className="net-value">{router.net.lanIn}</div>
              </div>
              <div className="net-box">
                <div className="net-label">LAN Out</div>
                <div className="net-value">{router.net.lanOut}</div>
              </div>
            </div>
          </section>

          <section className="system-info">
            <h4>System Information</h4>
            <div className="info-grid">
              <div><strong>Active Connections</strong><div>{router.system.activeConns}</div></div>
              <div><strong>Firmware</strong><div>{router.system.firmware}</div></div>
              <div><strong>Model</strong><div>{router.system.model}</div></div>
            </div>
          </section>
        </article>
      </main>

    </div>
  );
}
