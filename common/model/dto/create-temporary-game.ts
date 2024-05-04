export interface CreateTemporaryGameDto {
    // leftImage and rightImage should be base64-encoded versions of bitmap images
    leftImage: string;
    rightImage: string;
    detectionRadius: number;
}
