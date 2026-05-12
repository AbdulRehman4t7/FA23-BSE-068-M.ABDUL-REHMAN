import { Injectable, computed, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { UserProfile } from '../models/user.model';

export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  cnic?: string;
  avatarFile?: File;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);
  readonly user = signal<User | null>(null);
  readonly profile = signal<UserProfile | null>(null);
  readonly isAuthenticated = computed(() => !!this.user());
  readonly isProfileComplete = computed(() => {
    const profile = this.profile();
    return !!profile?.phone && !!profile?.full_name;
  });

  constructor(
    private readonly supabase: SupabaseService,
    private readonly router: Router
  ) {
    this.restoreSession();
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
      void this.loadProfile();
    });

    effect(() => {
      if (!this.user()) {
        this.profile.set(null);
      }
    });
  }

  private async restoreSession(): Promise<void> {
    const { data } = await this.supabase.client.auth.getSession();
    this.session.set(data.session);
    this.user.set(data.session?.user ?? null);
    await this.loadProfile();
  }

  async signUp(payload: SignUpPayload): Promise<void> {
    const { data, error } = await this.supabase.client.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          phone: payload.phone,
          cnic: payload.cnic ?? null
        }
      }
    });
    if (error) {
      throw error;
    }
    const user = data.user;
    if (!user) {
      return;
    }

    let avatarUrl: string | null = null;
    if (payload.avatarFile) {
      const filePath = `avatars/${user.id}-${Date.now()}-${payload.avatarFile.name}`;
      const upload = await this.supabase.client.storage
        .from('profile-photos')
        .upload(filePath, payload.avatarFile, { upsert: true });
      if (upload.error) {
        throw upload.error;
      }
      avatarUrl = this.supabase.client.storage.from('profile-photos').getPublicUrl(filePath).data.publicUrl;
    }

    const upsert = await this.supabase.client.from('profiles').upsert({
      id: user.id,
      full_name: payload.fullName,
      phone: payload.phone,
      cnic: payload.cnic ?? null,
      avatar_url: avatarUrl
    });
    if (upsert.error) {
      throw upsert.error;
    }
  }

  async login(email: string, password: string, rememberMe: boolean): Promise<void> {
    localStorage.setItem('remember-session', rememberMe ? 'true' : 'false');
    const { data, error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    if (!data.session) {
      throw new Error('Please verify your email before logging in.');
    }
    this.session.set(data.session);
    this.user.set(data.user);
    await this.loadProfile();
    if (!this.isProfileComplete()) {
      await this.router.navigate(['/profile/complete']);
      return;
    }
    await this.router.navigate(['/dashboard']);
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) {
      throw error;
    }
    this.user.set(null);
    this.profile.set(null);
    await this.router.navigate(['/auth/login']);
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`
    });
    if (error) {
      throw error;
    }
  }

  async loadProfile(): Promise<void> {
    const userId = this.user()?.id;
    if (!userId) {
      return;
    }
    const { data, error } = await this.supabase.client.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      return;
    }
    this.profile.set(data as UserProfile);
  }
}
