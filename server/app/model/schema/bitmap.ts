import { ImageInfo } from './image-info';

export interface Bitmap {
    imageInfo: ImageInfo;
    pixels: number[][];
}
