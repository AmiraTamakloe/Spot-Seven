import { ImageInfo } from '@app/model/schema/image-info';

export const defaultImageInfo: ImageInfo = {
    signature: 'BM',
    fileSize: 921654,
    width: 640,
    height: 480,
    colorDepth: 24,
    pixelMapStart: 54,
    topDown: true,
};

export const defaultBitmap = { imageInfo: defaultImageInfo, imageFilename: 'somefilename.bmp', pixels: [[0]] };
