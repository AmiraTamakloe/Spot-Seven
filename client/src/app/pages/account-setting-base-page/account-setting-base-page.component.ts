import { Component } from '@angular/core';
import { ThemeService } from '@app/services/theme/theme.service';

@Component({
    selector: 'app-account-setting-base-page',
    templateUrl: './account-setting-base-page.component.html',
    styleUrl: './account-setting-base-page.component.scss',
})
export class AccountSettingBasePageComponent {
    constructor(public themeService: ThemeService) {}
}
