
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  LogOut,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import {
  getAdminStats,
  getAdminUsers,
} from '../../services/adminService';

import './AdminDashboardPage.css';

const PAGE_SIZE = 20;

const SENSITIVE_KEY = /password|token|secret|credential|salt|hash/i;

// Extract response data
function getRoot(payload) {
  return payload?.data ?? payload;
}

// Convert nested statistics into displayable key-value pairs
function flattenStats(value, prefix = '', depth = 0) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    depth > 3
  ) {
    return [];
  }

  return Object.entries(value).flatMap(([key, item]) => {
    if (SENSITIVE_KEY.test(key)) return [];

    const label = prefix ? `${prefix}.${key}` : key;

    if (item === null || item === undefined) return [];

    if (typeof item === 'object' && !Array.isArray(item)) {
      return flattenStats(item, label, depth + 1);
    }

    if (Array.isArray(item)) {
      if (
        item.every(
          (entry) =>
            entry === null ||
            ['string', 'number', 'boolean'].includes(typeof entry)
        )
      ) {
        return [
          {
            key: label,
            value: item
              .filter((entry) => entry !== null)
              .join(', '),
          },
        ];
      }

      return [];
    }

    if (
      typeof item === 'number' ||
      typeof item === 'string' ||
      typeof item === 'boolean'
    ) {
      return [{ key: label, value: item }];
    }

    return [];
  });
}

// Format field names
function toLabel(value) {
  return String(value)
    .replace(/\./g, ' / ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// Format statistics
function formatStat(value, key = '') {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    if (
      /rate|ratio|probability|percentage|percent/i.test(key) &&
      Math.abs(value) <= 1
    ) {
      return `${(value * 100).toFixed(2)}%`;
    }

    return value.toLocaleString('en-US', {
      maximumFractionDigits: 4,
    });
  }

  return String(value);
}

// Extract users from API response
function extractUsers(payload) {
  const root = getRoot(payload);

  if (Array.isArray(root)) return root;

  for (const key of ['users', 'items', 'results']) {
    if (Array.isArray(root?.[key])) {
      return root[key];
    }
  }

  return [];
}

// Extract total user count
function extractTotal(payload) {
  const root = getRoot(payload);

  const values = [
    root?.total,
    root?.total_count,
    root?.total_users,
    root?.count,
    root?.pagination?.total,
    root?.meta?.total,
  ];

  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') {
      const number = Number(value);

      if (Number.isFinite(number) && number >= 0) {
        return number;
      }
    }
  }

  return null;
}

// API error handling
function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(', ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (error?.response?.status === 403) {
    return 'Access denied. Your account may not have admin permission.';
  }

  if (error?.response?.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  return error?.message || 'Something went wrong.';
}

// Preferred user columns
const USER_COLUMN_GROUPS = [
  ['name', 'full_name', 'username', 'display_name'],
  ['email'],
  ['role'],
  ['is_active', 'active', 'status'],
  ['created_at', 'createdAt', 'created_on', 'registered_at'],
  ['id', '_id', 'user_id'],
];

// Only display scalar values
function isSafeScalar(value) {
  return (
    value === null ||
    value === undefined ||
    ['string', 'number', 'boolean'].includes(typeof value)
  );
}

// Detect columns available in the API response
function getUserColumns(users) {
  const keys = [
    ...new Set(
      users.flatMap((user) => Object.keys(user ?? {}))
    ),
  ].filter((key) => !SENSITIVE_KEY.test(key));

  const selected = [];

  for (const group of USER_COLUMN_GROUPS) {
    const match = group.find((key) => keys.includes(key));

    if (
      match &&
      users.some((user) => isSafeScalar(user?.[match]))
    ) {
      selected.push(match);
    }
  }

  for (const key of keys) {
    if (
      !selected.includes(key) &&
      users.some((user) => isSafeScalar(user?.[key]))
    ) {
      selected.push(key);
    }
  }

  return selected.slice(0, 8);
}

// Format user fields
function formatUserValue(key, value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Active' : 'Inactive';
  }

  if (
    typeof value === 'string' &&
    /created|registered|joined|date|last_login/i.test(key)
  ) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
  }

  if (typeof value === 'number') {
    return value.toLocaleString('en-US');
  }

  return String(value);
}

// Choose an icon for each statistic
function getStatIcon(key, index) {
  const name = key.toLowerCase();

  if (name.includes('user')) return Users;

  if (name.includes('assessment') || name.includes('loan')) {
    return ClipboardList;
  }

  if (name.includes('risk') || name.includes('fail')) {
    return ShieldAlert;
  }

  if (name.includes('success') || name.includes('active')) {
    return ShieldCheck;
  }

  const icons = [Activity, Database, Users, ClipboardList];

  return icons[index % icons.length];
}

// Statistic card
function StatCard({ item, index }) {
  const Icon = getStatIcon(item.key, index);

  return (
    <article className="adm-stat-card">
      <div className="adm-stat-top">
        <span>{toLabel(item.key)}</span>

        <div className="adm-stat-icon">
          <Icon size={18} />
        </div>
      </div>

      <strong>{formatStat(item.value, item.key)}</strong>
    </article>
  );
}

// User value with status badge
function UserValue({ column, value }) {
  const normalized = String(value ?? '').toLowerCase();

  if (
    column === 'role' ||
    column === 'status' ||
    column === 'is_active' ||
    column === 'active'
  ) {
    const isAdmin = normalized === 'admin';

    const isInactive = [
      'inactive',
      'disabled',
      'false',
      '0',
    ].includes(normalized);

    return (
      <span
        className={`adm-user-badge ${
          isAdmin
            ? 'adm-badge-admin'
            : isInactive
              ? 'adm-badge-inactive'
              : 'adm-badge-neutral'
        }`}
      >
        {formatUserValue(column, value)}
      </span>
    );
  }

  return (
    <span
      className="adm-user-value"
      title={String(value ?? '')}
    >
      {formatUserValue(column, value)}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(null);

  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const [statsError, setStatsError] = useState('');
  const [usersError, setUsersError] = useState('');

  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load statistics and users
  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      setStatsLoading(true);
      setStatsError('');

      try {
        const response = await getAdminStats({
          signal: controller.signal,
        });

        const root = getRoot(response);
        const source = root?.stats ?? root?.summary ?? root;

        setStats(flattenStats(source));
      } catch (error) {
        if (!controller.signal.aborted) {
          setStats([]);
          setStatsError(getErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setStatsLoading(false);
        }
      }
    }

    async function loadUsers() {
      setUsersLoading(true);
      setUsersError('');

      try {
        const response = await getAdminUsers({
          limit: PAGE_SIZE,
          skip: page * PAGE_SIZE,
          signal: controller.signal,
        });

        setUsers(extractUsers(response));
        setTotalUsers(extractTotal(response));
      } catch (error) {
        if (!controller.signal.aborted) {
          setUsers([]);
          setTotalUsers(null);
          setUsersError(getErrorMessage(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setUsersLoading(false);
        }
      }
    }

    loadStats();
    loadUsers();

    return () => controller.abort();
  }, [page, refreshKey]);

  // Dynamic user columns
  const userColumns = useMemo(
    () => getUserColumns(users),
    [users]
  );

  // Pagination
  const hasPrevious = page > 0;

  const hasNext =
    totalUsers !== null
      ? (page + 1) * PAGE_SIZE < totalUsers
      : users.length === PAGE_SIZE;

  // Logout using AuthContext
  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="adm-page">
      {/* Header */}
      <header className="adm-header">
        <Link to="/" className="adm-brand">
          <span className="adm-brand-mark">
            <ShieldCheck size={21} />
          </span>

          <span>
            <strong>CredLens</strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </Link>

        <button
          type="button"
          className="adm-logout"
          onClick={handleLogout}
        >
          <LogOut size={15} />
          Logout
        </button>
      </header>

      <section className="adm-main">
        {/* Page heading */}
        <div className="adm-heading">
          <div>
            <span className="adm-eyebrow">
              ADMINISTRATION
            </span>

            <h1>Admin Dashboard</h1>

            <p>
              Review administrative statistics and registered
              accounts from the backend.
            </p>
          </div>

          <button
            type="button"
            className="adm-refresh"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={statsLoading || usersLoading}
          >
            <RefreshCw size={15} />
            Refresh data
          </button>
        </div>

        {/* Platform statistics */}
        <section className="adm-section">
          <div className="adm-section-heading">
            <div>
              <h2>Platform statistics</h2>
              <p>
                Values returned by the admin stats endpoint.
              </p>
            </div>

            <span className="adm-api-tag">
              ADMIN API
            </span>
          </div>

          {statsLoading ? (
            <div className="adm-state adm-state-compact">
              <div className="adm-loader" />
              Loading statistics...
            </div>
          ) : statsError ? (
            <div className="adm-inline-error">
              <strong>Statistics unavailable</strong>
              <span>{statsError}</span>
            </div>
          ) : stats.length === 0 ? (
            <div className="adm-empty">
              No scalar statistics were returned by the API.
            </div>
          ) : (
            <div className="adm-stat-grid">
              {stats.map((item, index) => (
                <StatCard
                  item={item}
                  index={index}
                  key={item.key}
                />
              ))}
            </div>
          )}
        </section>

        {/* Registered users */}
        <section className="adm-section adm-users-section">
          <div className="adm-section-heading">
            <div>
              <h2>Registered users</h2>
              <p>
                User accounts returned by the admin users endpoint.
              </p>
            </div>

            {totalUsers !== null && (
              <span className="adm-user-total">
                {totalUsers.toLocaleString('en-US')} users
              </span>
            )}
          </div>

          <div className="adm-table-card">
            {usersLoading ? (
              <div className="adm-state">
                <div className="adm-loader" />
                <strong>Loading users</strong>
                <span>
                  Retrieving registered accounts...
                </span>
              </div>
            ) : usersError ? (
              <div className="adm-state">
                <div className="adm-error-icon">!</div>
                <strong>Users unavailable</strong>
                <span>{usersError}</span>

                <button
                  type="button"
                  className="adm-retry"
                  onClick={() => setRefreshKey((value) => value + 1)}
                >
                  Try again
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="adm-state">
                <div className="adm-empty-icon">
                  <Users size={22} />
                </div>

                <strong>No users found</strong>
                <span>
                  There are no user records on this page.
                </span>

                {page > 0 && (
                  <button
                    type="button"
                    className="adm-retry"
                    onClick={() => setPage(0)}
                  >
                    Back to first page
                  </button>
                )}
              </div>
            ) : userColumns.length === 0 ? (
              <div className="adm-state">
                <div className="adm-empty-icon">
                  <Users size={22} />
                </div>
                <strong>No displayable user fields</strong>
                <span>
                  The API returned user records without
                  supported scalar fields.
                </span>
              </div>
            ) : (
              <>
                <div className="adm-table-scroll">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        {userColumns.map((column) => (
                          <th key={column}>
                            {toLabel(column)}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user, index) => {
                        const userId =
                          user?.id ??
                          user?._id ??
                          user?.user_id ??
                          `${page}-${index}`;

                        return (
                          <tr key={String(userId)}>
                            {userColumns.map((column) => (
                              <td key={column}>
                                <UserValue
                                  column={column}
                                  value={user?.[column]}
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="adm-pagination">
                  <span>
                    {totalUsers !== null
                      ? `Showing ${
                          page * PAGE_SIZE + 1
                        }–${
                          page * PAGE_SIZE + users.length
                        } of ${totalUsers}`
                      : `Showing ${users.length} records`}
                  </span>

                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((value) => value - 1)
                      }
                      disabled={!hasPrevious || usersLoading}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <strong>{page + 1}</strong>

                    <button
                      type="button"
                      onClick={() =>
                        setPage((value) => value + 1)
                      }
                      disabled={!hasNext || usersLoading}
                      aria-label="Next page"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="adm-footer">
          <span>CredLens Administration</span>
          <span>Data supplied by the backend API</span>
        </footer>
      </section>
    </main>
  );
}