import { Injectable } from '@angular/core';
import { UserProfile } from '../models/user.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfileById(id: string): Promise<UserProfile> {
    const { data, error } = await this.supabase.client.from('profiles').select('*').eq('id', id).single();
    if (error) {
      throw error;
    }
    return data as UserProfile;
  }

  async updateProfile(id: string, patch: Partial<UserProfile>): Promise<UserProfile> {
    const computedPatch = this.computeReputationAndBadge(patch);
    const { data, error } = await this.supabase.client
      .from('profiles')
      .update(computedPatch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      throw error;
    }
    return data as UserProfile;
  }

  private computeReputationAndBadge(profile: Partial<UserProfile>): Partial<UserProfile> {
    const completed = profile.total_committees_completed ?? 0;
    const score = Math.min(5, Math.max(0, Number((1 + completed * 0.5).toFixed(1))));
    const badge = score >= 4.5 ? 'elite' : score >= 3.5 ? 'verified' : score >= 2.5 ? 'trusted' : 'new';
    return { ...profile, reputation_score: score, badge };
  }
}
