import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageStubComponent } from '@app/stubs/main-page.component.stub';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ButtonComponent],
            imports: [RouterTestingModule.withRoutes([{ path: '*', component: MainPageStubComponent }])],
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('button component should create', () => {
        expect(component).toBeTruthy();
    });

    it('clicking on the button should play soundEffect', () => {
        const fakeAudio = {
            play: async () => undefined,
        } as HTMLAudioElement;
        const audioSpy = spyOn(window, 'Audio').and.returnValue(fakeAudio);
        const playSpy = spyOn(fakeAudio, 'play').and.callThrough();
        component.clickSoundEffect();
        expect(audioSpy).toHaveBeenCalledWith('./assets/audio/clickSound.mp3');
        expect(playSpy).toHaveBeenCalled();
    });
});
