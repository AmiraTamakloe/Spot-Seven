import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TIME_STRING_BEGIN_OFFSET, TIME_STRING_END_OFFSET } from '@app/components/history-modal/history-modal.constants';
import { MILLISECONDS_IN_ONE_SECOND } from '@app/constants';
import { GameMode } from '@common/game-mode';
import { History } from '@common/model/history';

export interface FormattedHistory {
    gameStartDate: string;
    gameTime: string;
    gameMode: string;
    formattedPlayers: FormattedPlayer;
}

export interface FormattedPlayer {
    players: string[];
    isWinner: number[];
    hasAbandonned: number[];
}

@Component({
    selector: 'app-history-modal',
    templateUrl: './history-modal.component.html',
    styleUrls: ['./history-modal.component.scss'],
})
export class HistoryModalComponent {
    displayedColumns: string[] = ['gameStart', 'gameTime', 'gameMode', 'player1', 'player2'];
    history: FormattedHistory[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) public data: History[], private modalRef: MatDialogRef<HistoryModalComponent>) {
        this.formatData();
    }

    close() {
        this.modalRef.close();
    }

    private formatData(): void {
        for (const hist of this.data) {
            const gameStartDate = this.formatDate(hist.gameStart);
            const gameTime = this.formatTime(hist.gameTime);
            const gameMode = this.formatGameMode(hist.gameMode);
            const formattedPlayers = this.formatPlayers(hist.players, hist.isWinner, hist.hasAbandonned);

            const formattedHist = {
                gameStartDate,
                gameTime,
                gameMode,
                formattedPlayers,
            };

            this.history.push(formattedHist);
        }
    }

    private formatDate(time: number): string {
        const date = new Date(time);
        return date.toLocaleString('mg-MG');
    }

    private formatTime(time: number): string {
        return new Date(MILLISECONDS_IN_ONE_SECOND * time).toTimeString().slice(TIME_STRING_BEGIN_OFFSET, TIME_STRING_END_OFFSET);
    }

    private formatGameMode(gameMode: GameMode): string {
        let mode = '';
        switch (gameMode) {
            case GameMode.Classic:
                mode = 'Classique';
                break;
            case GameMode.ClassicTeam:
                mode = 'Classique en équipe';
                break;
            case GameMode.TimeLimited:
                mode = 'Temps Limité';
                break;
            case GameMode.TimeLimitedImproved:
                mode = 'Temps Limité Augmenté';
                break;
        }
        return mode;
    }

    private formatPlayers(players: string[], isWinner?: number, hasAbandonned?: number): FormattedPlayer {
        const isWinnerTable = [0, 0];
        const hasAbandonnedTable = [0, 0];
        // !== undefined because we want to enter the if statement if the value of the index is 0
        if (isWinner !== undefined) isWinnerTable[isWinner] = 1;
        if (hasAbandonned !== undefined) hasAbandonnedTable[hasAbandonned] = 1;

        return {
            players,
            isWinner: isWinnerTable,
            hasAbandonned: hasAbandonnedTable,
        };
    }
}
