import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  Server,
  ShieldCheck,
  X,
  Loader2,
  RefreshCw,
  Bell,
  Zap,
  Clock,
  BarChart2,
  TrendingDown,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import api from '../api/axiosConfig';

// ─── Constants ────────────────────────────────────────────────────────────────
const SEVERITY_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#3b82f6', CRITICAL: '#a855f7' };
const SCAN_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

// ─── Helpers ──────────────────────────────────────────────────────────────────
const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

// ─── Sub-components ───────────────────────────────────────────────────────────

const SeverityBadge = ({ severity }) => (
  <span className={`severity-badge severity-${severity?.toLowerCase()}`}>{severity}</span>
);

const StatCard = ({ title, value, icon: Icon, tone, sub }) => (
  <motion.article
    className={`glass-panel stat-card ${tone}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div>
      <h2>{title}</h2>
      <strong>{value}</strong>
      {sub && <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>{sub}</small>}
    </div>
    <Icon size={28} />
  </motion.article>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, offline } = useSelector((state) => state.auth);

  // Account & scan state
  const [account, setAccount] = useState(null);        // { roleArn, accountName }
  const [scanData, setScanData] = useState(null);       // latest scan report (counts)
  const [findings, setFindings] = useState([]);
  const [findingsSummary, setFindingsSummary] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);   // List of previous scans
  const [latestScanId, setLatestScanId] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const scanTimerRef = useRef(null);

  // Modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [roleArn, setRoleArn] = useState('');
  const [accountName, setAccountName] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState(null);

  // ── Persist Account across refreshes ───────────────────────────────────────
  useEffect(() => {
    if (user?.id || user?.email) {
      const storedKey = `spendwise_account_${user.id || user.email}`;
      const stored = localStorage.getItem(storedKey);
      if (stored) {
        setAccount(JSON.parse(stored));
      }
    }
  }, [user]);

  const saveAccountLocal = (acc) => {
    setAccount(acc);
    if (user?.id || user?.email) {
      localStorage.setItem(`spendwise_account_${user.id || user.email}`, JSON.stringify(acc));
    }
  };

  // ── Fetch findings + summary + recommendations after scan ──────────────────
  const fetchScanDetails = useCallback(async (scanId) => {
    try {
      const [findingsRes, summaryRes, reportRes] = await Promise.all([
        api.get(`/finding/${scanId}`),
        api.get(`/finding/summary/${scanId}`),
        api.get(`/report/${scanId}`)
      ]);
      setFindings(findingsRes.data.findings || []);
      setFindingsSummary(summaryRes.data.summary || []);
      if (reportRes.data.report) {
        setScanData(reportRes.data.report);
      }
    } catch (_) {/* silently ignore — UI shows empty state */ }

    // Recommendations come async from backend job — poll after short delay
    setTimeout(async () => {
      try {
        const recRes = await api.get(`/recommendations?scanId=${scanId}`);
        setRecommendations(recRes.data.recommendations || []);
      } catch (_) { }
    }, 8000);
  }, []);

  // ── Core scan function ─────────────────────────────────────────────────────
  const runScan = useCallback(async (arn = account?.roleArn, email = user?.email) => {
    if (!arn || !email) return;
    setScanning(true);
    setScanError(null);

    try {
      const res = await api.post('/report/scan', { roleArn: arn, email });
      const report = res.data.report;
      setScanData(report);
      setLastScanned(new Date());

      // fetch latest scan id for detailed data
      const scansRes = await api.post('/report/latestScans', { roleArn: arn });
      const history = scansRes.data.scanList || [];
      setScanHistory(history);

      const latest = history[0];
      if (latest?.scanId) {
        setLatestScanId(latest.scanId);
        await fetchScanDetails(latest.scanId);
      }
    } catch (err) {
      setScanError(err.response?.data?.message || 'Scan failed. Check your Role ARN and try again.');
    } finally {
      setScanning(false);
    }
  }, [account, user, fetchScanDetails]);

  // ── Initial load & Auto-scan scheduler ────────────────────────────────────
  useEffect(() => {
    if (!account) return;

    // Load history first, don't just blindly scan on refresh!
    api.post('/report/latestScans', { roleArn: account.roleArn })
      .then(res => {
        const history = res.data.scanList || [];
        setScanHistory(history);
        
        const latest = history[0];
        const lastScanDate = latest?.scanDate ? new Date(latest.scanDate) : null;
        
        if (latest?.scanId) {
          setLatestScanId(latest.scanId);
          setLastScanned(lastScanDate);
          fetchScanDetails(latest.scanId);
        }

        // If no scan exists, or it's older than 12 hours -> trigger a new scan
        const now = new Date();
        if (!lastScanDate || (now - lastScanDate) > SCAN_INTERVAL_MS) {
          runScan(account.roleArn, user?.email);
        }
      })
      .catch(console.error);

    scanTimerRef.current = setInterval(() => {
      runScan(account.roleArn, user?.email);
    }, SCAN_INTERVAL_MS);

    return () => clearInterval(scanTimerRef.current);
  }, [account, user, runScan, fetchScanDetails]);

  // ── Connect AWS – opens CloudFormation then shows modal ───────────────────
  const handleInitialConnectClick = () => {
    window.open(
      'https://console.aws.amazon.com/cloudformation/home?region=ap-south-1#/stacks/create/review?templateURL=https://spendwise-project.s3.ap-south-1.amazonaws.com/CloudFormation-template/spendwise-role-template.yaml',
      '_blank',
    );
    setShowConnectModal(true);
    setModalError(null);
    setRoleArn('');
    setAccountName('');
  };

  const submitAWSConnection = async (e) => {
    e.preventDefault();
    setConnectLoading(true);
    setModalError(null);

    try {
      await api.post('/cloudAccount/connect', { roleArn, accountName });
      saveAccountLocal({ roleArn, accountName });
      setConnectionMessage(`✓ "${accountName}" connected. Running first scan…`);
      setShowConnectModal(false);
    } catch (err) {
      if (offline || !err.response) {
        saveAccountLocal({ roleArn, accountName });
        setConnectionMessage('Demo mode: connection accepted locally.');
        setShowConnectModal(false);
      } else {
        setModalError(err.response?.data?.message || 'Connection failed. Check your Role ARN.');
      }
    } finally {
      setConnectLoading(false);
    }
  };

  // ── Derived chart data ─────────────────────────────────────────────────────
  const severityChartData = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => ({
    name: s,
    value: findingsSummary
      .filter((f) => f._id?.severity === s)
      .reduce((a, b) => a + b.count, 0),
  })).filter((d) => d.value > 0);

  const resourceTypeChartData = findings.reduce((acc, f) => {
    const existing = acc.find((a) => a.name === f.resourceType);
    if (existing) existing.count += 1;
    else acc.push({ name: f.resourceType, count: 1 });
    return acc;
  }, []);

  const totalInstances = scanData?.regions?.reduce(
    (acc, r) => acc + (r.instances?.length || 0), 0,
  ) || 0;
  const totalVolumes = scanData?.regions?.reduce(
    (acc, r) => acc + (r.volumes?.length || 0), 0,
  ) || 0;
  const totalBuckets = scanData?.s3?.length || 0;
  const highSeverityCount = findings.filter((f) => f.severity === 'HIGH' || f.severity === 'CRITICAL').length;
  const estimatedSavings = recommendations.reduce((acc, r) => {
    const match = r.estimatedSavings?.match(/\$?([\d.]+)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);

  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', listStyle: 'none', padding: 0, margin: '1rem 0 0' }}>
        {payload.map((entry, index) => (
          <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontSize: '0.85rem', fontWeight: 600, background: 'transparent' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }} />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          padding: '12px 16px', 
          background: '#0f172a', 
          border: '1px solid rgba(255,255,255,0.2)', 
          borderRadius: '8px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          pointerEvents: 'none'
        }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {payload[0].name}
          </p>
          <p style={{ margin: '4px 0 0', color: '#fff', fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'baseline', gap: '6px', background: 'transparent' }}>
            {payload[0].value}
            <small style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94a3b8', background: 'transparent', border: 'none', padding: 0 }}>Findings</small>
          </p>
        </div>
      );
    }
    return null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-page">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div>
          <div className="eyebrow compact">
            <ShieldCheck size={16} />
            <span>{offline ? 'Frontend session' : 'Authenticated session'}</span>
          </div>
          <h1>Dashboard</h1>
          <p>
            Welcome back, <strong>{user?.name || 'cloud owner'}</strong>.
            {account && <span style={{ color: 'var(--text-secondary)' }}> · {account.accountName}</span>}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {account && scanHistory.length > 0 && (
            <select 
              className="input-field" 
              style={{ width: 'auto', minWidth: '180px', padding: '0.5rem', height: '38px', margin: 0, fontSize: '0.85rem' }}
              value={latestScanId || ''}
              onChange={(e) => {
                setLatestScanId(e.target.value);
                fetchScanDetails(e.target.value);
              }}
              disabled={scanning}
            >
              <optgroup label="Scan History">
                {scanHistory.map((scan, idx) => (
                  <option key={scan.scanId} value={scan.scanId}>
                    {idx === 0 ? 'Latest: ' : ''}{new Date(scan.scanDate).toLocaleString()}
                  </option>
                ))}
              </optgroup>
            </select>
          )}

          {account && (
            <button
              type="button"
              className="btn-secondary compact-button"
              style={{ height: '38px' }}
              onClick={() => runScan()}
              disabled={scanning}
            >
              {scanning ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
              {scanning ? 'Scanning…' : 'Re-scan'}
            </button>
          )}
          {!account && (
            <button type="button" onClick={handleInitialConnectClick} className="btn-primary">
              <PlusCircle size={20} />
              Connect AWS Account
            </button>
          )}
        </div>
      </header>

      {/* ── Connection message ──────────────────────────────────────────────── */}
      {connectionMessage && (
        <div className="form-message notice dashboard-notice" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{connectionMessage}</span>
        </div>
      )}

      {/* ── Scan error ──────────────────────────────────────────────────────── */}
      {scanError && (
        <div className="form-message error dashboard-notice" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{scanError}</span>
        </div>
      )}

      {/* ── Scanning progress banner ─────────────────────────────────────────── */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel"
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(59,130,246,0.3)' }}
          >
            <Loader2 size={20} className="spin" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <strong>Scanning your AWS account…</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Collecting EC2, EBS &amp; S3 data across all regions. This may take a minute.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
        <StatCard title="EC2 Instances" value={account ? totalInstances : '—'} icon={Server} tone="teal" sub={account ? `across ${scanData?.regions?.length || 0} regions` : 'Connect account'} />
        <StatCard title="EBS Volumes" value={account ? totalVolumes : '—'} icon={BarChart2} tone="gold" />
        <StatCard title="S3 Buckets" value={account ? totalBuckets : '—'} icon={Activity} tone="green" />
        <StatCard title="High/Critical Issues" value={account ? highSeverityCount : '—'} icon={AlertTriangle} tone={highSeverityCount > 0 ? 'red' : 'green'} />
        <StatCard
          title="Est. Monthly Savings"
          value={account && estimatedSavings > 0 ? `$${estimatedSavings.toFixed(0)}` : account ? 'Calculating…' : '—'}
          icon={DollarSign}
          tone="green"
          sub={lastScanned ? `Last scan: ${lastScanned.toLocaleTimeString()}` : ''}
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      {account && findingsSummary.length > 0 && (
        <div className="dashboard-charts-row">
          {/* Severity pie chart */}
          <div className="glass-panel chart-panel">
            <h3><Zap size={18} /> Findings by Severity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={severityChartData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  innerRadius={60}
                  paddingAngle={5}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {severityChartData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderCustomLegend} verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Resource type bar chart */}
          {resourceTypeChartData.length > 0 && (
            <div className="glass-panel chart-panel">
              <h3><BarChart2 size={18} /> Findings by Resource Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resourceTypeChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}



      {/* ── Recommendations ──────────────────────────────────────────────────── */}
      <section className="glass-panel recommendations-panel">
        <div className="panel-title">
          <TrendingDown size={28} />
          <div>
            <h2>Cost Optimization Recommendations</h2>
            <p>Auto-generated from your latest AWS scan · updated every 12 hours</p>
          </div>
        </div>

        {!account ? (
          <div className="empty-state">
            <Server size={48} />
            <h3>No AWS account connected</h3>
            <p>Connect your AWS account to unlock automated cost recommendations.</p>
            <button type="button" onClick={handleInitialConnectClick} className="btn-secondary">
              Connect AWS Now
            </button>
          </div>
        ) : scanning ? (
          <div className="empty-state">
            <Loader2 size={40} className="spin" style={{ color: 'var(--accent-primary)' }} />
            <h3>Generating recommendations…</h3>
            <p>The AI-powered recommendation engine is analyzing your resources.</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={40} style={{ color: '#22c55e' }} />
            <h3>No recommendations yet</h3>
            <p>Recommendations appear here shortly after a scan completes. Try re-scanning.</p>
          </div>
        ) : (
          <div className="recommendation-list">
            {[...recommendations]
              .sort((a, b) => (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99))
              .map((rec, idx) => (
                <motion.article
                  key={rec._id || idx}
                  className={`recommendation-row ${rec.severity?.toLowerCase()}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="recommendation-meta">
                      <span>{rec.resourceType}</span>
                      <SeverityBadge severity={rec.severity} />
                      {rec.resourceId && <small style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{rec.resourceId}</small>}
                    </div>
                    <p><strong>{rec.issue}</strong> — {rec.message}</p>
                    {rec.action && <p style={{ fontSize: '0.85rem', color: '#93c5fd', marginTop: '0.25rem' }}>→ {rec.action}</p>}
                  </div>
                  <div className="savings">
                    <small>Est. Savings</small>
                    <strong>{rec.estimatedSavings || 'N/A'}</strong>
                  </div>
                </motion.article>
              ))}
          </div>
        )}
      </section>

      {/* ── Findings detail table ────────────────────────────────────────────── */}
      {account && findings.length > 0 && (
        <section className="glass-panel recommendations-panel" style={{ marginTop: '1.5rem' }}>
          <div className="panel-title">
            <Bell size={28} />
            <div>
              <h2>All Findings</h2>
              <p>{findings.length} issue{findings.length !== 1 ? 's' : ''} detected in latest scan</p>
            </div>
          </div>
          <div className="recommendation-list">
            {findings.map((f, idx) => (
              <motion.article
                key={f._id || idx}
                className={`recommendation-row ${f.severity?.toLowerCase()}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                <div style={{ flex: 1 }}>
                  <div className="recommendation-meta">
                    <span>{f.resourceType}</span>
                    <SeverityBadge severity={f.severity} />
                    <small style={{ color: 'var(--text-secondary)' }}>{f.region}</small>
                  </div>
                  <p>{f.issue}</p>
                  {f.metadata && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {Object.entries(f.metadata).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="savings">
                  <small><Clock size={12} /> {new Date(f.createdAt).toLocaleDateString()}</small>
                  <strong style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{f.resourceId}</strong>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* ── AWS Connect Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="modal-overlay" onClick={() => setShowConnectModal(false)}>
            <motion.div
              className="modal-content glass-panel"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src="/Logo.png" alt="SpendWise" className="auth-logo" />
              <h2 style={{ margin: '0.75rem 0 0.3rem', fontSize: '1.7rem' }}>Connect AWS</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                A new tab has opened — create the IAM Role via CloudFormation,
                then paste the generated <strong style={{ color: '#fff' }}>Role ARN</strong> below.
              </p>

              {modalError && (
                <div className="form-message error" style={{ marginTop: '0.75rem' }}>
                  {modalError}
                </div>
              )}

              <form onSubmit={submitAWSConnection} style={{ marginTop: '1.4rem' }}>
                <div className="form-group">
                  <label>Account Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Production Account"
                    value={accountName} onChange={(e) => setAccountName(e.target.value)} required disabled={connectLoading} />
                </div>
                <div className="form-group">
                  <label>Role ARN</label>
                  <input type="text" className="input-field" placeholder="arn:aws:iam::123456789012:role/SpendWiseRole"
                    value={roleArn} onChange={(e) => setRoleArn(e.target.value)} required disabled={connectLoading} />
                </div>
                <button type="submit" className="btn-primary full-button" disabled={connectLoading}>
                  {connectLoading && <Loader2 size={18} className="spin" />}
                  {connectLoading ? 'Verifying Identity…' : 'Connect to SpendWise'}
                </button>
              </form>

              <p className="auth-switch" style={{ marginTop: '1rem' }}>
                <button type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
                  onClick={() => setShowConnectModal(false)}>
                  Cancel
                </button>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
