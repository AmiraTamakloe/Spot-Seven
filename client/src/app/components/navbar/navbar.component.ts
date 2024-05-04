import { Component } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { ThemeService } from '@app/services/theme/theme.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    showChatWindow = false;
    constructor(public themeService: ThemeService, private accountService: AccountService) {}

    isLoggedIn() {
        return this.accountService.isLoggedIn();
    }

    toggleChatWindow() {
        this.showChatWindow = !this.showChatWindow;
    }
}
