import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { profileCompleteGuard } from './core/guards/profile-complete.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup.component').then(m => m.SignupComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent)
      }
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      {
        path: 'complete',
        loadComponent: () => import('./features/profile/profile-complete.component').then(m => m.ProfileCompleteComponent)
      },
      {
        path: 'view',
        canActivate: [profileCompleteGuard],
        loadComponent: () => import('./features/profile/profile-view.component').then(m => m.ProfileViewComponent)
      },
      {
        path: 'edit',
        canActivate: [profileCompleteGuard],
        loadComponent: () => import('./features/profile/profile-edit.component').then(m => m.ProfileEditComponent)
      },
      {
        path: ':id',
        canActivate: [profileCompleteGuard],
        loadComponent: () => import('./features/profile/public-profile.component').then(m => m.PublicProfileComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, profileCompleteGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'committee',
    canActivate: [authGuard, profileCompleteGuard],
    children: [
      {
        path: 'create',
        loadComponent: () => import('./features/committee/create-committee.component').then(m => m.CreateCommitteeComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/committee/committee-detail.component').then(m => m.CommitteeDetailComponent)
      },
      {
        path: ':id/members',
        loadComponent: () => import('./features/committee/committee-members.component').then(m => m.CommitteeMembersComponent)
      },
      {
        path: ':id/payments',
        loadComponent: () => import('./features/committee/committee-payments.component').then(m => m.CommitteePaymentsComponent)
      }
    ]
  },
  {
    path: 'notifications',
    canActivate: [authGuard, profileCompleteGuard],
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
