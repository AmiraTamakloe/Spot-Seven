import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
    @Input() color: string = 'white';
    @Input() type: string = 'button';
    @Input() isDisabled: boolean = false;
    @Input() icon: string = '';
    @Input() link: string = '';

    clickSoundEffect() {
        const music = new Audio('./assets/audio/clickSound.mp3');
        music.play();
    }
}
