import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const jwt = localStorage.getItem('jwt');

  if (jwt) {
    const clone = req.clone({
      setHeaders: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    console.log(clone);
    return next(clone);
  }
  return next(req);
};
