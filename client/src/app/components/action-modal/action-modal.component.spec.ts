import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActionModalComponent } from './action-modal.component';

import SpyObj = jasmine.SpyObj;

describe('ActionModalComponent', () => {
    let component: ActionModalComponent;
    let fixture: ComponentFixture<ActionModalComponent>;
    let modalRefSpy: SpyObj<MatDialogRef<ActionModalComponent>>;

    const fakeMatDialogData = {
        title: 'title',
        message: 'message',
        actions: [],
    };

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj(MatDialogRef<ActionModalComponent>, ['close']);

        await TestBed.configureTestingModule({
            declarations: [ActionModalComponent],
            providers: [
                { provide: MatDialogRef<ActionModalComponent>, useValue: modalRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: fakeMatDialogData },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ActionModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('execute should call the callback if one is provided', () => {
        const action = {
            label: 'action',
            callback: () => {
                return;
            },
        };

        const callbackSpy = spyOn(action, 'callback');

        component.execute(action, 0);
        expect(callbackSpy).toHaveBeenCalledTimes(1);
    });

    it('execute should close the modal if close is true', () => {
        const action = {
            label: 'action',
            close: true,
        };

        const modalIndex = 0;

        component.execute(action, modalIndex);
        expect(modalRefSpy.close).toHaveBeenCalledOnceWith(modalIndex);
    });
});
