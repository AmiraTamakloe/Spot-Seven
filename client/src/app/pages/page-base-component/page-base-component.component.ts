import { Component } from '@angular/core';
import { ThemeService } from '@app/services/theme/theme.service';

@Component({
    selector: 'app-page-base-component',
    templateUrl: './page-base-component.component.html',
    styleUrls: ['./page-base-component.component.scss'],
})
export class PageBaseComponent {
    constructor(public themeService: ThemeService) {}
}
