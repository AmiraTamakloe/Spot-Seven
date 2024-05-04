import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import SpyObj = jasmine.SpyObj;
import { FriendListModalComponent } from './friend-list-modal.component';

describe('ActionModalComponent', () => {
    let component: FriendListModalComponent;
    let fixture: ComponentFixture<FriendListModalComponent>;
    let modalRefSpy: SpyObj<MatDialogRef<FriendListModalComponent>>;

    const fakeMatDialogData = {
        title: 'title',
        message: 'message',
        actions: [],
    };

    beforeEach(async () => {
        modalRefSpy = jasmine.createSpyObj(MatDialogRef<FriendListModalComponent>, ['close']);

        await TestBed.configureTestingModule({
            declarations: [FriendListModalComponent],
            providers: [
                { provide: MatDialogRef<FriendListModalComponent>, useValue: modalRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: fakeMatDialogData },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(FriendListModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
