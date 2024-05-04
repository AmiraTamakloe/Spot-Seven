import { GoogleLoginProvider, GoogleSigninButtonModule, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DifferencesPreviewModalComponent } from '@app/components/differences-preview-modal/differences-preview-modal.component';
import { GameSheetComponent } from '@app/components/game-sheet/game-sheet.component';
import { ImageAreaComponent } from '@app/components/image-area/image-area.component';
import { LoadImageButtonComponent } from '@app/components/load-image-button/load-image-button.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { ConfigurationComponent } from '@app/pages/configuration/configuration.component';
import { CreateGamePageComponent } from '@app/pages/create-game-page/create-game-page.component';
import { ActionModalComponent } from './components/action-modal/action-modal.component';
import { AnimatedBackgroundComponent } from './components/animated-background/animated-background.component';
import { AppearanceComponent } from './components/appearance/appearance.component';
import { ButtonComponent } from './components/button/button.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ChatBubbleBarComponent } from './components/chat-bubble-bar/chat-bubble-bar.component';
import { ChatPanelComponent } from './components/chat-panel/chat-panel.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { ConvoComponent } from './components/convo/convo.component';
import { CreateChatComponent } from './components/create-chat/create-chat.component';
import { ErrorModalComponent } from './components/error-modal/error-modal.component';
import { FriendCardComponent } from './components/friend-card/friend-card.component';
import { FriendListModalComponent } from './components/friend-list-modal/friend-list-modal.component';
import { FriendListComponent } from './components/friend-list/friend-list.component';
import { GameConstantsModalComponent } from './components/game-constants-modal/game-constants-modal.component';
import { GameSelectionPanelComponent } from './components/game-selection-panel/game-selection-panel.component';
import { HistoryModalComponent } from './components/history-modal/history-modal.component';
import { ImageAreaGameComponent } from './components/image-area-game/image-area-game.component';
import { LanguageDropdownComponent } from './components/language-dropdown/language-dropdown.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LoadingModalComponent } from './components/loading-modal/loading-modal.component';
import { MessageComponent } from './components/message/message.component';
import { MusicModalComponent } from './components/music-modal/music-modal.component';
import { MusicSelectorComponent } from './components/music/music-selector.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ObserverGameSessionComponent } from './components/observer-game-session/observer-game-session.component';
import { PaintToolsComponent } from './components/paint-tools/paint-tools.component';
import { ReplaysListComponent } from './components/replays-list/replays-list.component';
import { ThemeSwitchComponent } from './components/theme/theme-switch.component';
import { TimerComponent } from './components/timer/timer.component';
import { UserModalCardComponent } from './components/user-modal-card/user-modal-card.component';
import { UserProfileDropdownComponent } from './components/user-profile-dropdown/user-profile-dropdown.component';
import { WaitingRoomComponent } from './components/waiting-room/waiting-room.component';
import { AccountSettingBasePageComponent } from './pages/account-setting-base-page/account-setting-base-page.component';
import { AccountStatisticComponent } from './pages/account-statistic/account-statistic.component';
import { AvatarComponent } from './pages/avatar/avatar.component';
import { ClassicModeComponent } from './pages/classic-mode/classic-mode.component';
import { CreateAccountPageComponent } from './pages/create-account-page/create-account-page.component';
import { FriendsComponent } from './pages/friends/friends.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { PageBaseComponent } from './pages/page-base-component/page-base-component.component';
import { ReplaysPageComponent } from './pages/replays-page/replays-page.component';
import { SelectionPageComponent } from './pages/selection-page/selection-page.component';
import { TimeLimitedModeComponent } from './pages/time-limited/time-limited-mode.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';
import { ChatService } from './services/chat/chat.service';
import { InterceptorService } from './services/interceptor/interceptor.service';
import { TranslocoRootModule } from './transloco-root.module';

import { AccountSidebarComponent } from './components/account-sidebar/account-sidebar.component';
import { ObserverSelectionPageComponent } from './pages/observer-selection-page/observer-selection-page.component';
import { PasswordModalComponent } from './components/password-modal/password-modal.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        ActionModalComponent,
        AppComponent,
        ButtonComponent,
        CreateGamePageComponent,
        ImageAreaComponent,
        LoadImageButtonComponent,
        DifferencesPreviewModalComponent,
        SelectionPageComponent,
        ObserverSelectionPageComponent,
        ConfigurationComponent,
        GameSheetComponent,
        LeaderboardComponent,
        GameSelectionPanelComponent,
        ErrorModalComponent,
        ClassicModeComponent,
        ImageAreaGameComponent,
        ThemeSwitchComponent,
        MainPageComponent,
        PageBaseComponent,
        CanvasComponent,
        MessageComponent,
        LoadingModalComponent,
        ConfirmModalComponent,
        AnimatedBackgroundComponent,
        PaintToolsComponent,
        TimeLimitedModeComponent,
        GamePageComponent,
        GameConstantsModalComponent,
        TimerComponent,
        HistoryModalComponent,
        LoginPageComponent,
        CreateAccountPageComponent,
        LanguageDropdownComponent,
        FriendsComponent,
        FriendCardComponent,
        FriendListComponent,
        AppearanceComponent,
        NavbarComponent,
        AccountSettingBasePageComponent,
        FriendListModalComponent,
        WaitingRoomComponent,
        WaitingRoomPageComponent,
        AccountSidebarComponent,
        AvatarComponent,
        AccountStatisticComponent,
        ReplaysPageComponent,
        ReplaysListComponent,
        UserModalCardComponent,
        ChatBubbleBarComponent,
        ChatPanelComponent,
        CreateChatComponent,
        ConvoComponent,
        UserProfileDropdownComponent,
        MusicModalComponent,
        MusicSelectorComponent,
        AccountSidebarComponent,
        ObserverGameSessionComponent,
        PasswordModalComponent,
        ProgressBarComponent,
    ],
    providers: [
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider('1016759648975-tfskfesj6oq8f8c004cls2q2lgpgmpjj.apps.googleusercontent.com'),
                    },
                ],
                onError: (err) => {
                    // eslint-disable-next-line no-console
                    console.error(err);
                },
            } as SocialAuthServiceConfig,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptorService,
            multi: true,
        },
        ChatService,
    ],
    bootstrap: [AppComponent],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        SocialLoginModule,
        TranslocoRootModule,
        SocialLoginModule,
        GoogleSigninButtonModule,
        MatProgressBarModule,
        MatSliderModule,
        MatSelectModule,
    ],
})
export class AppModule {}
