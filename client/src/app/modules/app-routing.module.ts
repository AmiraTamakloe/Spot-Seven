import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountStatisticComponent } from '@app/pages/account-statistic/account-statistic.component';
import { AvatarComponent } from '@app/pages/avatar/avatar.component';
import { ClassicModeComponent } from '@app/pages/classic-mode/classic-mode.component';
import { ConfigurationComponent } from '@app/pages/configuration/configuration.component';
import { CreateAccountPageComponent } from '@app/pages/create-account-page/create-account-page.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { FriendsComponent } from '@app/pages/friends/friends.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ObserverSelectionPageComponent } from '@app/pages/observer-selection-page/observer-selection-page.component';
import { ReplaysPageComponent } from '@app/pages/replays-page/replays-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { TimeLimitedModeComponent } from '@app/pages/time-limited/time-limited-mode.component';
import { WaitingRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';
import { adminGuard, authGuard } from '@app/services/auth-guard/auth.guard';

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent, canActivate: [authGuard] },
    { path: 'config', component: ConfigurationComponent, canActivate: [adminGuard] },
    { path: 'classic', component: ClassicModeComponent, canActivate: [authGuard] },
    { path: 'create-game', component: CreateGamePageComponent, canActivate: [adminGuard] },
    { path: 'selection', component: SelectionPageComponent, canActivate: [authGuard] },
    { path: 'time-limited', component: TimeLimitedModeComponent, canActivate: [authGuard] },
    { path: 'observer-selection', component: ObserverSelectionPageComponent, canActivate: [authGuard] },
    { path: 'replays', component: ReplaysPageComponent, canActivate: [authGuard] },
    { path: 'waiting-room/:gameMode/:gameId/:gameName', component: WaitingRoomPageComponent, canActivate: [authGuard] },
    { path: 'waiting-room/:gameMode', component: WaitingRoomPageComponent, canActivate: [authGuard] },
    { path: 'create-account', component: CreateAccountPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'friends', component: FriendsComponent, canActivate: [authGuard] },
    { path: 'avatar', component: AvatarComponent, canActivate: [authGuard] },
    { path: 'statistic', component: AccountStatisticComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/login' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
