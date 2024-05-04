import { Component } from '@angular/core';
import { avatarsUrl } from '@app/constants/avatars-url';
import { AccountService } from '@app/services/account/account.service';

@Component({
    selector: 'app-user-profile-dropdown',
    templateUrl: './user-profile-dropdown.component.html',
    styleUrls: ['./user-profile-dropdown.component.scss'],
})
export class UserProfileDropdownComponent {
    username: string = '';
    currentAvatar!: string;
    avatarsUrl: { url: string; name: string }[] = avatarsUrl;
    constructor(private accountService: AccountService) {
        this.accountService.getUser().subscribe((user) => {
            this.username = user.username;
            if (this.avatarsUrl.some((avatar) => avatar.name === user.avatar)) {
                this.currentAvatar = `./assets/avatar/${user.avatar}`;
            } else {
                if (user.avatar) {
                    this.accountService.getAvatarUrl(user.avatar).subscribe((res) => {
                        this.currentAvatar = `data:image/png;base64,${res}`;
                    });
                }
            }
        });
    }

    logout() {
        this.accountService.logOut();
    }
}
