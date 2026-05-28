// =============================================
// CitizenConnect — API Client & Utilities
// =============================================

const API = (() => {
  // const BASE = 'http://localhost:5000/api';
  // const BASE = 'http://127.0.0.1:5000/api';
  // const BASE = 'http://127.0.0.1:5000/api';
  const BASE = 'http://127.0.0.1:5000/api';

  function getToken() { return localStorage.getItem('cc_token'); }
  function setToken(t) { localStorage.setItem('cc_token', t); }
  function clearToken() { localStorage.removeItem('cc_token'); localStorage.removeItem('cc_user'); }

  async function request(method, path, body, isForm = false) {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (!isForm) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = isForm ? body : JSON.stringify(body);

    const res = await fetch(BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  return {
    getToken, setToken, clearToken,
    get:    (path)         => request('GET', path),
    post:   (path, body, isForm) => request('POST', path, body, isForm),
    patch:  (path, body)   => request('PATCH', path, body),
    delete: (path)         => request('DELETE', path),

    // Auth
    login:    (email, pw)   => request('POST', '/auth/login',    { email, password: pw }),
    register: (data)        => request('POST', '/auth/register', data),
    me:       ()            => request('GET',  '/auth/me'),
    updateProfile: (data)   => request('PATCH', '/auth/profile', data),

    // Issues
    getIssues:    (params = {}) => request('GET', '/issues?' + new URLSearchParams(params)),
    getIssue:     (id)          => request('GET', '/issues/' + id),
    submitIssue:  (fd)          => request('POST', '/issues', fd, true),
    updateStatus: (id, data)    => request('PATCH', '/issues/' + id + '/status', data),
    respond:      (id, data)    => request('PATCH', '/issues/' + id + '/respond', data),
    addComment:   (id, text)    => request('POST', '/issues/' + id + '/comments', { text }),
    addFeedback:  (id, data)    => request('POST', '/issues/' + id + '/feedback', data),

    // Notifications
    getNotifs:   ()   => request('GET', '/notifications'),
    readNotif:   (id) => request('PATCH', '/notifications/' + id + '/read'),
    readAllNotifs:()  => request('PATCH', '/notifications/read-all'),

    // Reports
    getReports:  ()   => request('GET', '/reports/summary'),
    getTrends:   ()   => request('GET', '/reports/trends'),

    // AI
    suggestResponse: (data) => request('POST', '/ai/suggest-response', data),
    categorize:      (data) => request('POST', '/ai/categorize', data),
  };
})();

// ── Auth State ────────────────────────────────
const Auth = {
  get user() { try { return JSON.parse(localStorage.getItem('cc_user') || 'null'); } catch { return null; } },
  set user(u) { localStorage.setItem('cc_user', JSON.stringify(u)); },
  isLoggedIn() { return !!API.getToken() && !!this.user; },
  logout() { API.clearToken(); window.location.href = '/index.html'; }
};

// ── Helpers ───────────────────────────────────
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-RW', { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusBadge(status) {
  const labels = { pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected' };
  return `<span class="badge badge-${status.replace('_','-')}">${labels[status] || status}</span>`;
}

function priorityBadge(p) {
  return `<span class="badge badge-${p}">${p.charAt(0).toUpperCase() + p.slice(1)}</span>`;
}

function showAlert(container, msg, type = 'success') {
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  container.innerHTML = `<div class="alert alert-${type}"><span>${icons[type]}</span>${msg}</div>`;
  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

function stars(n) {
  return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
}

// ── Guard: redirect if not logged in ─────────
function requireAuth(role) {
  if (!Auth.isLoggedIn()) { window.location.href = '/index.html'; return null; }
  if (role && Auth.user.role !== role && Auth.user.role !== 'admin') {
    window.location.href = '/' + Auth.user.role + '/dashboard.html';
    return null;
  }
  return Auth.user;
}

// ── Topbar builder ────────────────────────────
function buildTopbar(container, isLeader = false) {
  const user = Auth.user;
  container.innerHTML = `
    <div class="topbar-brand">
      <span style="font-size:22px">🏛️</span>
      <span>CitizenConnect</span>
      ${isLeader ? '<span style="font-size:11px;background:var(--amber-light);color:var(--amber);padding:2px 8px;border-radius:20px;font-weight:600">Leader</span>' : ''}
    </div>
    <div class="topbar-right">
      <a href="${isLeader ? '/leader/notifications.html' : '/citizen/notifications.html'}" style="position:relative;color:var(--text-muted);font-size:20px;text-decoration:none" id="notif-btn" title="Notifications">
        🔔 <span id="notif-count" style="display:none;position:absolute;top:-4px;right:-4px;background:var(--red);color:#fff;border-radius:50%;width:16px;height:16px;font-size:10px;font-weight:700;display:none;align-items:center;justify-content:center"></span>
      </a>
      <div class="avatar ${isLeader ? 'leader' : ''}">${initials(user?.name)}</div>
      <span style="font-size:14px;font-weight:500">${user?.name || ''}</span>
      <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">Sign out</button>
    </div>`;

  // Load notification count
  API.getNotifs().then(data => {
    const el = document.getElementById('notif-count');
    if (el && data.unreadCount > 0) {
      el.textContent = data.unreadCount;
      el.style.display = 'flex';
    }
  }).catch(() => {});
}
