import { ImageArea } from '@common/enums/image-area';

export interface CanvasAction {
    imageArea: ImageArea;
    action: (context: CanvasRenderingContext2D) => void;
}
