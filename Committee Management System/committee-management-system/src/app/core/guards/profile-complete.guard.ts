import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ProfileService } from '../services/profile.service';

export const profileCompleteGuard: CanActivateFn = async () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  const profile = profileService.currentProfile();
  
  if (!profile) {
    return true; // Let the route load, it will handle loading the profile
  }

  if (!profileService.isProfileComplete(profile)) {
    router.navigate(['/profile/complete']);
    return false;
  }

  return true;
};
