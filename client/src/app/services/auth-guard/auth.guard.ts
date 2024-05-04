/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AccountService } from '@app/services/account/account.service';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
    const accountService: AccountService = inject(AccountService);
    const router: Router = inject(Router);

    return accountService.isLoggedIn() ? true : router.parseUrl('/login');
};

export const adminGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
    const accountService: AccountService = inject(AccountService);
    const router: Router = inject(Router);
    if (accountService.isLoggedIn() && accountService.getAdmin()) {
        return true;
    }
    return router.parseUrl('/home');
};
