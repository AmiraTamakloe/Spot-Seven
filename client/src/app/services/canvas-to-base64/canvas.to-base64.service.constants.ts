import { IMAGE_HEIGHT, IMAGE_WIDTH } from '@app/constants';

export const OFFSET_FILE_SIZE = 2;
export const OFFSET_PIXEL_MAP = 10;
export const OFFSET_DIB_HEADER_SIZE = 14;
export const OFFSET_IMAGE_WIDTH = 18;
export const OFFSET_IMAGE_HEIGHT = 22;
export const OFFSET_COLOR_PLANES = 26;
export const OFFSET_COLOR_DEPTH = 28;

// The number of bytes in a row must be a multiple of 4 bytes
export const PADDING_BYTES = 4;
export const PADDING_BITS = 32;

export const BMP_MAGIC = 0x4d42;
export const IMAGE_COLOR_PLANES = 1;
export const IMAGE_COLOR_DEPTH = 24;

export const FILE_HEADER_SIZE = 14;
export const DIB_HEADER_SIZE = 40;
export const HEADER_SIZE = FILE_HEADER_SIZE + DIB_HEADER_SIZE;
export const ROW_SIZE = Math.ceil((IMAGE_COLOR_DEPTH * IMAGE_WIDTH) / PADDING_BITS) * PADDING_BYTES;
export const PIXEL_ARRAY_SIZE = ROW_SIZE * IMAGE_HEIGHT;
export const FILE_SIZE = HEADER_SIZE + PIXEL_ARRAY_SIZE;

export const BYTE_MASK = 0xff;

export const BYTES_PER_PIXEL = 4;
