import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { ConfirmModalComponent } from './confirm-modal.component';

import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('ConfirmModalComponent', () => {
    let component: ConfirmModalComponent;
    let fixture: ComponentFixture<ConfirmModalComponent>;
    let modalSpy: SpyObj<MatDialogRef<ConfirmModalComponent>>;

    const modalData = {
        confirmMessage: 'salut',
    };

    beforeEach(async () => {
        modalSpy = jasmine.createSpyObj(MatDialogRef, ['close']);

        await TestBed.configureTestingModule({
            declarations: [ConfirmModalComponent, ButtonStubComponent],
            providers: [
                { provide: MatDialogRef, useValue: modalSpy },
                { provide: MAT_DIALOG_DATA, useValue: modalData },
            ],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
