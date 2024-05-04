/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { GameService } from '@app/services/game-service/game.service';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { GuessResultClassicSuccess, GuessResultTimeLimited, GuessResultTimeLimitedSuccess, ResultType } from '@common/model/guess-result';

@Injectable({
    providedIn: 'root',
})
export class TimeLimitedModeService extends GameService {
    // FIXME: a bit ugly to fix if we have time
    endGame(gameResult: EndGameResultDto) {
        this.stopTimer();

        let message;
        if (this.isObservingPlayer) {
            if (gameResult.isForfeit) {
                message = 'La partie observée est terminée dû à un abandon';
            } else message = 'La partie observée a pris fin.';
        } else {
            if (gameResult.isForfeit) {
                message = 'Votre adversaire a abandonné la partie. Vous avez gagné!';
            } else {
                const messageWinner =
                    'time-limited-mode.Vous avez gagné le jeu! Vous avez légalement le droit de claim le titre de légende du jeu des 7 différences.';
                message = gameResult.isWinner
                    ? this.translocoService.translate(messageWinner)
                    : this.translocoService.translate('time-limited-mode.Le temps est écoulé vous avez perdu ! Get good');
                if (gameResult.isWinner) {
                    this.musicService.playWinningSoundEffect();
                }
            }
        }
        this.modalService.createEndGameModal(message, async () => this.router.navigate(['/home']));
        super.endGame(gameResult);
    }

    initializeObserverGame(guessResults: (GuessResultClassicSuccess | GuessResultTimeLimitedSuccess)[]) {
        guessResults.forEach(() => {
            // TODO: link with 2-4 players mode
            this.foundDifferences++;
        });
    }

    protected async onDifferenceFound(guessResult: GuessResultTimeLimited): Promise<void> {
        this.foundDifferences++;
        if (guessResult.type === ResultType.Success && guessResult.game) {
            this.gameInfo.game = guessResult.game;
            this.loadImages();
            this.bonusSubject.next(this.gameInfo.differenceFoundBonus);
            if (this.cheatModeDifferences) {
                this.cheatModeDifferences = await this.getRemainingDifferences();
            }
        }
        super.onDifferenceFound(guessResult);
    }
}
