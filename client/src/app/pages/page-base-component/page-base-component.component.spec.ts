import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageBaseComponent } from './page-base-component.component';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('PageBaseComponent', () => {
    let component: PageBaseComponent;
    let fixture: ComponentFixture<PageBaseComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PageBaseComponent],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(PageBaseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
