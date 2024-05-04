import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PasswordModalComponent } from './password-modal.component';
import SpyObj = jasmine.SpyObj;

describe('PasswordModalComponent', () => {
    let component: PasswordModalComponent;
    let fixture: ComponentFixture<PasswordModalComponent>;
    let modalRefSpy: SpyObj<MatDialogRef<PasswordModalComponent>>;

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj('MatDialogRef<PasswordModalComponent>', ['open', 'close']);
        await TestBed.configureTestingModule({
            declarations: [PasswordModalComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef<PasswordModalComponent>, useValue: modalRefSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PasswordModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
