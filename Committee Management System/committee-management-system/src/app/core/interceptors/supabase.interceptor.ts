import { HttpInterceptorFn } from '@angular/common/http';

export const supabaseInterceptor: HttpInterceptorFn = (req, next) => {
  // Add any custom headers or logic for Supabase requests
  return next(req);
};
