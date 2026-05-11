import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly storage = typeof window !== 'undefined' && sessionStorage.getItem('sb-remember-me') === 'false' ? sessionStorage : localStorage;

  readonly client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: this.storage
    }
  });
}
