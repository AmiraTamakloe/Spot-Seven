import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
    selector: 'app-account-sidebar',
    templateUrl: './account-sidebar.component.html',
    styleUrl: './account-sidebar.component.scss',
})
export class AccountSidebarComponent {
    @ViewChild('sidenav', { static: true })
    sidenav!: MatSidenav;

    toggle() {
        this.sidenav.toggle();
    }
}
