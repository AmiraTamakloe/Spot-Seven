/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { Subject } from 'rxjs';

import { ImageArea } from '@common/enums/image-area';
import { CanvasComponent } from './canvas.component';

describe('CanvasComponent', () => {
    let component: CanvasComponent;
    let fixture: ComponentFixture<CanvasComponent>;
    let actionSubject: Subject<CanvasAction>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CanvasComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(CanvasComponent);
        component = fixture.componentInstance;
        actionSubject = new Subject<CanvasAction>();
        component.actionObservable = actionSubject;
        component.imageArea = ImageArea.ORIGINAL;
        component.clearOnCreate = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call callback function passed to next', () => {
        const mockAction = {
            imageArea: ImageArea.BOTH,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
            action: (_) => {
                return;
            },
        } as CanvasAction;

        const actionSpy = spyOn(mockAction, 'action');
        actionSubject.next(mockAction);

        expect(actionSpy).toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe if actionSubscription is defined', () => {
        const unsubscribeSpy = spyOn<any>(component.actionSubscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalledTimes(1);

        component.actionSubscription = undefined;
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
    });
});
