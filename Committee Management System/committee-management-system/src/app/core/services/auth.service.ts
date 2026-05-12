import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  loading = signal(true);

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.initAuth();
  }

  private async initAuth() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.currentUser.set(session?.user ?? null);
    this.loading.set(false);

    this.supabase.auth.onAuthStateChange((_event: string, session: any) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  async signUp(email: string, password: string, fullName: string, phone: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string, rememberMe: boolean = false) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    }

    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
    
    localStorage.removeItem('rememberMe');
    this.router.navigate(['/auth/login']);
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) throw error;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  }

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = this.supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getUserId(): string | undefined {
    return this.currentUser()?.id;
  }
}
