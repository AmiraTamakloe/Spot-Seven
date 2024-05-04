/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component } from '@angular/core';
import { Preferences } from '@app/enums/preferences';
import { PreferencesDto } from '@app/interfaces/preferences';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { ThemeService } from '@app/services/theme/theme.service';

@Component({
    selector: 'app-theme-switch',
    templateUrl: './theme-switch.component.html',
    styleUrl: './theme-switch.component.scss',
})
export class ThemeSwitchComponent {
    preferences!: PreferencesDto;
    constructor(public themeService: ThemeService, private preferencesService: PreferencesService) {}
    ngOnInit(): void {
        if (this.preferencesService.canSetPreferences()) {
            this.preferencesService.getAccountPreferences().subscribe((preferences) => {
                if (preferences?.theme) {
                    this.themeService.setTheme(preferences.theme);
                    this.preferences = preferences as PreferencesDto;
                }
            });
        }
    }
    toggleTheme(theme: string) {
        this.themeService.updateTheme();
        this.preferences = { ...this.preferences, theme };
        if (this.preferencesService.canSetPreferences()) {
            this.preferencesService.updateAccountPreferences(this.preferences, Preferences.Theme);
        }
    }
}
