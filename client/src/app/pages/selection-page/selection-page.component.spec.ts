import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { GameSelectionPanelStubComponent } from '@app/stubs/game-selection-panel.component.stub';
import { SelectionPageComponent } from './selection-page.component';
import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;
    let matDialogSpy: SpyObj<MatDialog>;
    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            declarations: [SelectionPageComponent, GameSelectionPanelStubComponent],
            providers: [
                {
                    provide: MatDialog,
                    useValue: matDialogSpy,
                },
            ],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
