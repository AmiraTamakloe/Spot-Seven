import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TEAM_MEMBERS, TEAM_NUMBER } from '@app/constants/initial-view-constants';
import { GameSelectionService } from '@app/services/game-selection/game-selection.service';
import { AccountService } from '@app/services/account/account.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    // eslint-disable-next-line max-params
    constructor(
        public gameSelectionService: GameSelectionService,
        public gameStartService: GameStartService,
        public modalService: ModalService,
        protected router: Router,
        readonly translocoService: TranslocoService,
        private accountService: AccountService,
    ) {}

    ngOnInit() {
        this.gameSelectionService.fetchGames();
    }
    getTeamNumber(): number {
        return TEAM_NUMBER;
    }

    getTeamMembers() {
        return TEAM_MEMBERS;
    }

    verifyAdminPassword() {
        this.modalService.createPasswordModal(
            this.translocoService.translate('main-page.Veuillez entrer le mot de passe administrateur'),
            (password: string) => {
                if (password === 'admin') {
                    this.accountService.setAdmin();
                    this.router.navigate(['/config']);
                } else if (password !== undefined) {
                    this.modalService.createInformationModal(
                        this.translocoService.translate('main-page.Mot de passe incorrect'),
                        this.translocoService.translate('main-page.Veuillez réessayer'),
                        'OK',
                    );
                }
            },
        );
    }

    openTimeLimitedModal() {
        if (this.gameSelectionService.gamesToRender.length === 0) {
            this.modalService.createInformationModal(
                this.translocoService.translate('main-page.Allez créer quelques jeux :)'),
                this.translocoService.translate("main-page.Il n'y a aucun jeu disponible pour le moment."),
                'OK',
            );
            return;
        } else {
            this.modalService.createTimeLimitedModal(
                () => this.timeLimited(),
                () => this.timeLimitedAugmented(),
            );
        }
    }
    timeLimited() {
        this.router.navigate(['/waiting-room/timeLimited']);
    }
    timeLimitedAugmented() {
        this.router.navigate(['/waiting-room/timeLimitedImproved/']);
    }
}
