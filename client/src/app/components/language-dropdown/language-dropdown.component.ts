import { Component, OnInit } from '@angular/core';
import { Preferences } from '@app/enums/preferences';
import { PreferencesDto } from '@app/interfaces/preferences';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-language-dropdown',
    templateUrl: './language-dropdown.component.html',
    styleUrl: './language-dropdown.component.scss',
})
export class LanguageDropdownComponent implements OnInit {
    preferences!: PreferencesDto;
    constructor(private translocoService: TranslocoService, private preferencesService: PreferencesService, public themeService: ThemeService) {}

    ngOnInit(): void {
        if (this.preferencesService.canSetPreferences()) {
            this.preferencesService.getAccountPreferences().subscribe((preferences) => {
                if (preferences?.language) {
                    this.translocoService.setActiveLang(preferences.language);
                    this.preferences = preferences as PreferencesDto;
                }
            });
        }
    }

    languageSelected(language: string) {
        this.translocoService.setActiveLang(language);
        this.preferences = { ...this.preferences, language };
        if (this.preferencesService.canSetPreferences()) {
            this.preferencesService.updateAccountPreferences(this.preferences, Preferences.Language);
        }
    }
}
