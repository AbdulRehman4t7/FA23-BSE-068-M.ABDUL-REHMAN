/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock Supabase client that uses localStorage for persistence
// Drop-in replacement for @supabase/supabase-js client
// All existing page code works unchanged with this mock

import { getDb, saveDb, type Database } from '@/lib/mock-db';

const AUTH_KEY = 'cinegold_auth_session';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return crypto.randomUUID();
}

type TableName = keyof Omit<Database, 'auth_users'>;

// A very small event emitter for auth state changes
type AuthCallback = (event: string, session: any) => void;
const authListeners: Set<AuthCallback> = new Set();

function notifyAuthListeners(event: string) {
  const session = getSession();
  authListeners.forEach(cb => cb(event, session));
}

function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return null;
}

function setSession(session: any) {
  if (session) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

// ---------------------------------------------------------------------------
// Resolve nested selects like 'movies(title)' or '*, showtimes(date, time, hall_number, movies(title))'
// ---------------------------------------------------------------------------

function resolveRelation(tableName: string, foreignKey: string, row: any, fields: string, db: Database): any {
  // Determine the related table and linking key
  const relationMappings: Record<string, { table: TableName; fk: string; type: 'one' | 'many' }> = {
    'showtimes.movies': { table: 'movies', fk: 'movie_id', type: 'one' },
    'bookings.showtimes': { table: 'showtimes', fk: 'showtime_id', type: 'one' },
    'bookings.profiles': { table: 'profiles', fk: 'user_id', type: 'one' },
    'seats.showtimes': { table: 'showtimes', fk: 'showtime_id', type: 'one' },
    'showtimes.seats': { table: 'seats', fk: 'showtime_id', type: 'many' },
  };

  const key = `${tableName}.${foreignKey}`;
  const mapping = relationMappings[key];
  if (!mapping) return null;

  const records = (db[mapping.table] as any[]) ?? [];

  if (mapping.type === 'one') {
    // Find the related record
    const relatedId = row[mapping.fk] ?? row.id;
    const related = records.find((r: any) => r.id === relatedId);
    if (!related) return null;

    // Parse the fields
    return pickFieldsWithNested(mapping.table, related, fields, db);
  }

  // many
  return records
    .filter((r: any) => r[mapping.fk] === row.id)
    .map((r: any) => pickFieldsWithNested(mapping.table, r, fields, db));
}

function pickFieldsWithNested(tableName: string, record: any, fieldsStr: string, db: Database): any {
  if (!record) return null;

  // Parse field string: "date, time, hall_number, movies(title)"
  const result: any = {};
  let i = 0;
  const fields = fieldsStr.trim();

  while (i < fields.length) {
    // Skip whitespace and commas
    while (i < fields.length && (fields[i] === ' ' || fields[i] === ',')) i++;
    if (i >= fields.length) break;

    // Read field name
    let name = '';
    while (i < fields.length && fields[i] !== ',' && fields[i] !== '(' && fields[i] !== ' ') {
      name += fields[i];
      i++;
    }

    // Skip whitespace
    while (i < fields.length && fields[i] === ' ') i++;

    if (i < fields.length && fields[i] === '(') {
      // Nested relation
      i++; // skip (
      let depth = 1;
      let nestedFields = '';
      while (i < fields.length && depth > 0) {
        if (fields[i] === '(') depth++;
        else if (fields[i] === ')') depth--;
        if (depth > 0) nestedFields += fields[i];
        i++;
      }
      result[name] = resolveRelation(tableName, name, record, nestedFields, db);
    } else if (name === '*') {
      Object.assign(result, record);
    } else if (name) {
      result[name] = record[name];
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Query Builder — mimics supabase.from(table).select().eq().order()...
// ---------------------------------------------------------------------------

interface QueryResult<T = any> {
  data: T | null;
  error: any;
  count?: number | null;
}

class MockQueryBuilder {
  private _table: TableName;
  private _operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private _selectFields: string = '*';
  private _filters: Array<{ column: string; op: string; value: any }> = [];
  private _orderBy: Array<{ column: string; ascending: boolean }> = [];
  private _limitNum: number | null = null;
  private _single: boolean = false;
  private _countOnly: boolean = false;
  private _headOnly: boolean = false;
  private _insertData: any = null;
  private _updateData: any = null;
  private _chainSelect: string | null = null;

  constructor(table: TableName) {
    this._table = table;
  }

  select(fields: string = '*', opts?: { count?: string; head?: boolean }): MockQueryBuilder {
    this._operation = 'select';
    this._selectFields = fields;
    if (opts?.count === 'exact') this._countOnly = true;
    if (opts?.head) this._headOnly = true;
    return this;
  }

  insert(data: any): MockQueryBuilder {
    this._operation = 'insert';
    this._insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: any): MockQueryBuilder {
    this._operation = 'update';
    this._updateData = data;
    return this;
  }

  delete(): MockQueryBuilder {
    this._operation = 'delete';
    return this;
  }

  eq(column: string, value: any): MockQueryBuilder {
    this._filters.push({ column, op: 'eq', value });
    return this;
  }

  neq(column: string, value: any): MockQueryBuilder {
    this._filters.push({ column, op: 'neq', value });
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }): MockQueryBuilder {
    this._orderBy.push({ column, ascending: opts?.ascending ?? true });
    return this;
  }

  limit(n: number): MockQueryBuilder {
    this._limitNum = n;
    return this;
  }

  single(): MockQueryBuilder {
    this._single = true;
    return this;
  }

  // Thenable: await or .then() triggers execution
  then(resolve: (value: QueryResult) => void, reject?: (err: any) => void): void {
    try {
      const result = this._execute();
      resolve(result);
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err });
    }
  }

  private _applyFilters(records: any[]): any[] {
    let result = [...records];
    for (const f of this._filters) {
      result = result.filter(r => {
        if (f.op === 'eq') return r[f.column] === f.value;
        if (f.op === 'neq') return r[f.column] !== f.value;
        return true;
      });
    }
    return result;
  }

  private _applyOrder(records: any[]): any[] {
    if (this._orderBy.length === 0) return records;
    return records.sort((a, b) => {
      for (const { column, ascending } of this._orderBy) {
        const va = a[column] ?? '';
        const vb = b[column] ?? '';
        if (va < vb) return ascending ? -1 : 1;
        if (va > vb) return ascending ? 1 : -1;
      }
      return 0;
    });
  }

  private _projectRow(row: any, db: Database): any {
    if (this._selectFields === '*') return { ...row };
    return pickFieldsWithNested(this._table, row, this._selectFields, db);
  }

  private _execute(): QueryResult {
    const db = getDb();
    const table = db[this._table] as any[];

    if (this._operation === 'select') {
      const filtered = this._applyFilters(table);
      let ordered = this._applyOrder(filtered);

      if (this._headOnly && this._countOnly) {
        return { data: null, error: null, count: filtered.length };
      }

      if (this._limitNum !== null) {
        ordered = ordered.slice(0, this._limitNum);
      }

      const projected = ordered.map(r => this._projectRow(r, db));

      if (this._single) {
        return { data: projected[0] ?? null, error: projected[0] ? null : { message: 'Row not found' } };
      }

      return { data: projected, error: null, count: filtered.length };
    }

    if (this._operation === 'insert') {
      const insertedRows: any[] = [];
      for (const item of this._insertData) {
        const newRow = {
          id: generateId(),
          created_at: new Date().toISOString(),
          ...item,
        };
        table.push(newRow);
        insertedRows.push(newRow);
      }
      saveDb(db);

      if (this._single || this._chainSelect !== null) {
        return { data: insertedRows[0] ?? null, error: null };
      }
      return { data: insertedRows, error: null };
    }

    if (this._operation === 'update') {
      const filtered = this._applyFilters(table);
      for (const row of filtered) {
        Object.assign(row, this._updateData);
      }
      saveDb(db);
      return { data: filtered, error: null };
    }

    if (this._operation === 'delete') {
      const filteredIds = new Set(this._applyFilters(table).map((r: any) => r.id));
      (db[this._table] as any[]).splice(0, table.length, ...table.filter((r: any) => !filteredIds.has(r.id)));
      saveDb(db);
      return { data: null, error: null };
    }

    return { data: null, error: { message: 'Unknown operation' } };
  }
}

// Wrap so .insert().select().single() chain works
function createQueryBuilder(table: TableName): any {
  const builder = new MockQueryBuilder(table);
  const originalInsert = builder.insert.bind(builder);

  // Override insert to allow .select().single() chain after
  builder.insert = (data: any) => {
    originalInsert(data);
    // Override select on the returned builder to just mark for chaining
    const origSelect = builder.select.bind(builder);
    builder.select = (fields?: string, opts?: any) => {
      (builder as any)._chainSelect = fields ?? '*';
      return builder;
    };
    return builder;
  };

  return builder;
}

// ---------------------------------------------------------------------------
// Auth module
// ---------------------------------------------------------------------------

const auth = {
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: any } }) {
    const db = getDb();
    const existing = db.auth_users.find(u => u.email === email);
    if (existing) {
      return { data: { user: null, session: null }, error: { message: 'User already registered' } };
    }

    const userId = generateId();
    const now = new Date().toISOString();
    const metadata = options?.data ?? {};

    const authUser = {
      id: userId,
      email,
      password,
      user_metadata: { name: metadata.name ?? '', phone: metadata.phone ?? '' },
    };

    db.auth_users.push(authUser);

    // Create profile
    db.profiles.push({
      id: userId,
      name: metadata.name ?? '',
      email,
      phone: metadata.phone ?? '',
      created_at: now,
    });

    // Create user role
    db.user_roles.push({
      id: generateId(),
      user_id: userId,
      role: 'user',
    });

    saveDb(db);

    return { data: { user: { id: userId, email, user_metadata: authUser.user_metadata }, session: null }, error: null };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const db = getDb();
    const authUser = db.auth_users.find(u => u.email === email && u.password === password);
    if (!authUser) {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    }

    const session = {
      user: {
        id: authUser.id,
        email: authUser.email,
        user_metadata: authUser.user_metadata,
      },
      access_token: `mock_token_${authUser.id}`,
      token_type: 'bearer',
    };

    setSession(session);
    setTimeout(() => notifyAuthListeners('SIGNED_IN'), 0);

    return { data: { user: session.user, session }, error: null };
  },

  async signOut() {
    setSession(null);
    setTimeout(() => notifyAuthListeners('SIGNED_OUT'), 0);
    return { error: null };
  },

  async getSession() {
    const session = getSession();
    return { data: { session }, error: null };
  },

  onAuthStateChange(callback: AuthCallback) {
    authListeners.add(callback);

    // Immediately fire with current state
    const session = getSession();
    setTimeout(() => callback(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session), 0);

    return {
      data: {
        subscription: {
          unsubscribe: () => { authListeners.delete(callback); },
        },
      },
    };
  },

  async updateUser({ password }: { password?: string }) {
    const session = getSession();
    if (!session) {
      return { data: { user: null }, error: { message: 'Not authenticated' } };
    }

    const db = getDb();
    const authUser = db.auth_users.find(u => u.id === session.user.id);
    if (!authUser) {
      return { data: { user: null }, error: { message: 'User not found' } };
    }

    if (password) {
      authUser.password = password;
      saveDb(db);
    }

    return { data: { user: session.user }, error: null };
  },
};

// ---------------------------------------------------------------------------
// Realtime stub (no-op but compatible)
// ---------------------------------------------------------------------------

class MockChannel {
  on(_event: string, _opts: any, _callback?: any): MockChannel {
    return this;
  }
  subscribe(): MockChannel {
    return this;
  }
}

// ---------------------------------------------------------------------------
// Exported mock client — drop-in replacement
// ---------------------------------------------------------------------------

export const supabase = {
  from(table: string) {
    return createQueryBuilder(table as TableName);
  },
  auth,
  channel(_name: string) {
    return new MockChannel();
  },
  removeChannel(_channel: any) {
    // no-op
  },
};
