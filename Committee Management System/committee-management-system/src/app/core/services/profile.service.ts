import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UserProfile, ProfileUpdateData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  currentProfile = signal<UserProfile | null>(null);

  constructor(private supabase: SupabaseService) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async loadCurrentProfile(userId: string) {
    try {
      const profile = await this.getProfile(userId);
      this.currentProfile.set(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async updateProfile(userId: string, updates: ProfileUpdateData): Promise<UserProfile> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    this.currentProfile.set(data);
    return data;
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  async getUsersByIds(userIds: string[]): Promise<UserProfile[]> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (error) throw error;
    return data || [];
  }

  isProfileComplete(profile: UserProfile | null): boolean {
    if (!profile) return false;
    
    return !!(
      profile.full_name &&
      profile.phone &&
      (profile.iban || profile.jazzcash_number || profile.easypaisa_number)
    );
  }

  getBadgeColor(badge: string): string {
    const colors: { [key: string]: string } = {
      'new': 'bg-gray-500',
      'trusted': 'bg-blue-500',
      'verified': 'bg-green-500',
      'elite': 'bg-amber-500'
    };
    return colors[badge] || 'bg-gray-500';
  }

  getBadgeIcon(badge: string): string {
    const icons: { [key: string]: string } = {
      'new': 'person',
      'trusted': 'verified_user',
      'verified': 'check_circle',
      'elite': 'stars'
    };
    return icons[badge] || 'person';
  }
}
