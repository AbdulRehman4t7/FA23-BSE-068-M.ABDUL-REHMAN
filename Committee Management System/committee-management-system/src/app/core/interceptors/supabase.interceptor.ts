import { HttpInterceptorFn } from '@angular/common/http';

export const supabaseInterceptor: HttpInterceptorFn = (req, next) => {
  const request = req.clone({
    setHeaders: {
      'X-App-Client': 'committee-management-system'
    }
  });
  return next(request);
};
