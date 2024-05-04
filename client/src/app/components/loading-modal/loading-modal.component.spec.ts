import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSpinnerStub } from '@app/stubs/mat-spinner.component.stub';
import { LoadingModalComponent } from './loading-modal.component';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('LoadingModalComponent', () => {
    let component: LoadingModalComponent;
    let fixture: ComponentFixture<LoadingModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LoadingModalComponent, MatSpinnerStub],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(LoadingModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
