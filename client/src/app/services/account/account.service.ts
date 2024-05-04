import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { HostListener, Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleUserInfo } from '@app/interfaces/google-user-info';
import { UserInfo } from '@app/interfaces/user-info';
import { ModalService } from '@app/services/modal/modal.service';
import { SocketService } from '@app/services/socket/socket.service';
import { REFRESH_TOKEN_KEY } from '@app/services/token/token.constants';
import { TokenService } from '@app/services/token/token.service';
import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';
import { LoginDto } from '@common/model/dto/login.dto';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AccountService implements OnDestroy {
    user: UserInfo | undefined;
    socialUser: SocialUser | undefined;
    isLoggedin?: boolean;
    isAdmin: boolean = false;
    incorrectUsernameOrPasswordSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    usernameAlreadyInUseSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private readonly baseUrl: string = environment.serverUrl;

    // eslint-disable-next-line max-params
    constructor(
        private readonly http: HttpClient,
        private router: Router,
        private tokenService: TokenService,
        private modalService: ModalService,
        private socialAuthService: SocialAuthService,
        private socketService: SocketService,
    ) {
        window.addEventListener('beforeunload', this.ngOnDestroy.bind(this));
    }

    @HostListener('window:beforeunload', ['$event'])
    ngOnDestroy(): void {
        this.logOut();
    }

    getUsername() {
        return this.tokenService.getUsername();
    }

    isLoggedIn(): boolean {
        return localStorage.getItem(REFRESH_TOKEN_KEY) !== null;
    }

    setAdmin() {
        this.isAdmin = true;
    }
    getAdmin(): boolean {
        return this.isAdmin;
    }

    async subscribeToSocialAuthService() {
        this.socialAuthService.authState.subscribe((user) => {
            this.isLoggedin = this.socialUser != null;
            this.socialUser = user;
            if (!this.isLoggedin) {
                this.logInAccountGoogle({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    idToken: user.idToken,
                } as GoogleUserInfo);
            }
        });
    }

    async logInAccount(info: LoginDto) {
        this.user = { username: info.username, password: info.password };
        this.http
            .post<JwtTokensDto>(`${this.baseUrl}/auth/login`, info)
            .pipe(
                catchError((error) => {
                    if (error.status === HttpStatusCode.Unauthorized) {
                        this.modalService.createInformationModal('Error', 'This user is already connected');
                    } else if (error.status === HttpStatusCode.BadRequest) {
                        this.incorrectUsernameOrPasswordSubject.next(true);
                    }
                    return throwError(() => new Error('Something bad happened; please try again.'));
                }),
            )
            .subscribe({
                next: (response: JwtTokensDto) => {
                    this.tokenService.setTokens(response);
                    this.socketService.connect().then(async () => this.router.navigate(['/home']));
                },
                error: (error) => {
                    throw new Error(error.error.message || 'Unknown error');
                },
            });
    }

    logInAccountGoogle(info: GoogleUserInfo) {
        this.http
            .post<JwtTokensDto>(`${this.baseUrl}/auth/google`, info)
            .pipe(
                catchError((error) => {
                    if (error.status === HttpStatusCode.Unauthorized) {
                        this.modalService.createInformationModal('Error', 'This user is already connected');
                    } else if (error.status === HttpStatusCode.BadRequest) {
                        this.incorrectUsernameOrPasswordSubject.next(true);
                    }
                    return throwError(() => new Error('Something bad happened; please try again.'));
                }),
            )
            .subscribe({
                next: (response: JwtTokensDto) => {
                    this.tokenService.setTokens(response);
                    this.socketService.connect().then(async () => this.router.navigate(['/home']));
                },
                error: (error) => {
                    throw new Error(error.error.message || 'Unknown error');
                },
            });
    }

    logOut() {
        this.socketService.disconnect();
        this.http.post(`${this.baseUrl}/auth/logout`, { username: this.tokenService.getUsername() }).subscribe();
        this.tokenService.removeTokens();
        this.socialAuthService.signOut();
        this.router.navigate(['/login']);
    }

    registerAccount(info: UserInfo) {
        return this.http
            .post(`${this.baseUrl}/auth/signup`, info)
            .pipe(
                catchError((error) => {
                    if (error.status === HttpStatusCode.Conflict) {
                        this.usernameAlreadyInUseSubject.next(true);
                    }
                    return throwError(() => new Error('Something bad happened; please try again.'));
                }),
            )
            .subscribe(() => {
                this.router.navigate(['/login']);
            });
    }

    getUser() {
        const username = this.getUsername();
        return this.http.get<UserInfo>(`${this.baseUrl}/auth/${username}`);
    }

    getSpecificUser(username: string) {
        return this.http.get<UserInfo>(`${this.baseUrl}/auth/${username}`);
    }

    getAvatarUrl(imageName: string) {
        return this.http.get(`${this.baseUrl}/auth/avatar/${imageName}`, { responseType: 'text' });
    }

    updateAccountParameters(user: UserInfo) {
        return this.http.put<UserInfo>(`${this.baseUrl}/auth/parameter`, user);
    }
}
