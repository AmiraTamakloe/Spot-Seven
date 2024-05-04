/* eslint-disable @typescript-eslint/no-magic-numbers */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MAX_GAME_CONST, MIN_GAME_CONST } from '@app/constants';
import { GameConstantsModalComponent } from './game-constants-modal.component';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('GameConstantsModalComponent', () => {
    let component: GameConstantsModalComponent;
    let fixture: ComponentFixture<GameConstantsModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameConstantsModalComponent],
            imports: [MatDialogModule, ...getTranslocoTestingModules()],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { constantMessage: 'Test constant message' },
                },
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameConstantsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the value of the form control', () => {
        const value = 10;
        component.gameConstantsFormControl.setValue(value);
        expect(component.getValue()).toEqual(value);
    });

    it('should have required validation on form control', () => {
        component.gameConstantsFormControl.setValue(10);
        expect(component.gameConstantsFormControl.hasError('required')).toBeFalse();
    });

    it('should have min validation on form control', () => {
        component.gameConstantsFormControl.setValue(MIN_GAME_CONST - 1);
        expect(component.gameConstantsFormControl.hasError('min')).toBeTrue();
        component.gameConstantsFormControl.setValue(MIN_GAME_CONST);
        expect(component.gameConstantsFormControl.hasError('min')).toBeFalse();
    });

    it('should have max validation on form control', () => {
        component.gameConstantsFormControl.setValue(MAX_GAME_CONST + 1);
        expect(component.gameConstantsFormControl.hasError('max')).toBeTrue();
        component.gameConstantsFormControl.setValue(MAX_GAME_CONST);
        expect(component.gameConstantsFormControl.hasError('max')).toBeFalse();
    });

    it('should have pattern validation on form control', () => {
        component.gameConstantsFormControl.setValue(2.11);
        expect(component.gameConstantsFormControl.hasError('pattern')).toBeTrue();
        component.gameConstantsFormControl.setValue(10);
        expect(component.gameConstantsFormControl.hasError('pattern')).toBeFalse();
    });
});
