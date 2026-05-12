import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly storage: Storage = {
    get length() {
      return localStorage.length + sessionStorage.length;
    },
    clear() {
      localStorage.clear();
      sessionStorage.clear();
    },
    getItem(key: string) {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    },
    key(index: number) {
      return localStorage.key(index) ?? sessionStorage.key(index);
    },
    removeItem(key: string) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    },
    setItem(key: string, value: string) {
      const remember = localStorage.getItem('remember-session') !== 'false';
      const target = remember ? localStorage : sessionStorage;
      const other = remember ? sessionStorage : localStorage;
      target.setItem(key, value);
      other.removeItem(key);
    }
  };

  readonly client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: this.storage
    }
  });
}
