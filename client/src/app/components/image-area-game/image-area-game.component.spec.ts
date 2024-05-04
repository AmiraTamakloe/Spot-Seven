// Used to spy on the private attributes
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { GameService } from '@app/services/game-service/game.service';
import { CanvasStubComponent } from '@app/stubs/canvas.component.stub';
import { ImageArea } from '@common/enums/image-area';
import { Subject } from 'rxjs';
import { ImageAreaGameComponent } from './image-area-game.component';
import SpyObj = jasmine.SpyObj;

describe('ImageAreaGameComponent', () => {
    let gameServiceSpy: SpyObj<GameService>;
    let component: ImageAreaGameComponent;
    let fixture: ComponentFixture<ImageAreaGameComponent>;

    beforeEach(async () => {
        const actionImageSubject = new Subject<CanvasAction>();
        const actionErrorSubject = new Subject<CanvasAction>();
        gameServiceSpy = jasmine.createSpyObj('GameService', ['handleClick']);
        gameServiceSpy.actionImageObservable = actionImageSubject.asObservable();
        gameServiceSpy.actionErrorObservable = actionErrorSubject.asObservable();
        await TestBed.configureTestingModule({
            declarations: [ImageAreaGameComponent, CanvasStubComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(ImageAreaGameComponent);
        component = fixture.componentInstance;
        component.gameService = gameServiceSpy;
        component.imageArea = ImageArea.ORIGINAL;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call handleClick() when clicked', () => {
        const event = {} as MouseEvent;
        component.onClick(event);
        expect(gameServiceSpy.handleClick).toHaveBeenCalledWith(component.imageArea, event);
    });

    it('canvasClass should return the correct class', () => {
        component.imageArea = ImageArea.ORIGINAL;
        expect(component.canvasClass).toEqual('left');
        component.imageArea = ImageArea.MODIFIED;
        expect(component.canvasClass).toEqual('right');
    });
});
