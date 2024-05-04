import { Component } from '@angular/core';
import { ThemeService } from '@app/services/theme/theme.service';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent {
    constructor(public themeService: ThemeService) {}
}
