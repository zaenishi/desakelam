/*
 * ============================================================
 * SUPABASE PROVIDER — OPTIONAL REALTIME-READY BACKEND
 * ============================================================
 *
 * Aktifkan dengan:
 *   DATABASE_CONFIG.provider = 'supabase'
 *
 * Isi:
 *   DATABASE_CONFIG.remote.supabase.url
 *   DATABASE_CONFIG.remote.supabase.anonKey
 *
 * Supabase REST digunakan agar tidak wajib memasang SDK besar.
 * Realtime di sisi browser menggunakan polling fallback.
 *
 * Production wajib memakai RLS/policy yang benar.
 */

class SupabaseDatabaseProvider {
  constructor(options = {}) {
    this.url = String(options.url || '').replace(/\/$/, '');
    this.anonKey = String(options.anonKey || '');
    this.usersTable = options.tableUsers || 'users';
    this.leaderboardTable =
      options.tableLeaderboard || 'leaderboard';
    this.pollTimer = null;
    this.lastLeaderboardHash = '';
  }

  isConfigured() {
    return Boolean(
      this.url &&
      this.anonKey
    );
  }

  headers() {
    return {
      apikey: this.anonKey,
      Authorization: `Bearer ${this.anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    };
  }

  async request(path, options = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'Supabase belum dikonfigurasi di config.js'
      );
    }

    const response = await fetch(
      `${this.url}/rest/v1/${path}`,
      {
        ...options,
        headers: {
          ...this.headers(),
          ...(options.headers || {})
        }
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `Supabase ${response.status}: ${message}`
      );
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async init() {
    if (!this.isConfigured()) return false;

    await this.getLeaderboard();
    return true;
  }

  async getUser(uid) {
    const rows = await this.request(
      `${this.usersTable}?uid=eq.${encodeURIComponent(uid)}&limit=1`
    );

    return Array.isArray(rows)
      ? rows[0] || null
      : null;
  }

  async saveUser(user) {
    const rows = await this.request(
      this.usersTable,
      {
        method: 'POST',
        headers: {
          Prefer: 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(user)
      }
    );

    return Array.isArray(rows)
      ? rows[0] || user
      : user;
  }

  async submitScore(entry) {
    const rows = await this.request(
      this.leaderboardTable,
      {
        method: 'POST',
        headers: {
          Prefer: 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(entry)
      }
    );

    return Array.isArray(rows)
      ? rows[0] || entry
      : entry;
  }

  async getLeaderboard(limit = GAME_CONFIG.leaderboard.maxEntries) {
    return this.request(
      `${this.leaderboardTable}?select=*&order=score.desc&limit=${Number(limit)}`
    );
  }

  subscribeLeaderboard(callback) {
    const interval =
      DATABASE_CONFIG.realtime.pollIntervalMs;

    this.unsubscribeLeaderboard();

    this.pollTimer = setInterval(
      async () => {
        try {
          const entries =
            await this.getLeaderboard();

          const hash =
            JSON.stringify(entries);

          if (hash === this.lastLeaderboardHash) {
            return;
          }

          this.lastLeaderboardHash = hash;

          if (typeof callback === 'function') {
            callback(entries);
          }
        } catch (error) {
          if (GAME_CONFIG.app.debug) {
            console.warn(
              '[Supabase]',
              error
            );
          }
        }
      },
      interval
    );

    return this.unsubscribeLeaderboard.bind(this);
  }

  unsubscribeLeaderboard() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
