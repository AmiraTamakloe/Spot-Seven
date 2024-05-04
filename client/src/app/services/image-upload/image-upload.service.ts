import { Injectable } from '@angular/core';
import { IMAGE_FILE_TYPE, IMAGE_SIZE } from '@app/constants';
import { ImageService } from '@app/services/image/image.service';
import { ImageArea } from '@common/enums/image-area';

@Injectable()
export class ImageUploadService {
    constructor(private imageService: ImageService) {}

    async onFileUpload(file: File, imageArea: ImageArea) {
        // Inspired by https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
        return new Promise<void>((resolve, reject) => {
            if (this.isImageTypeAndSizeCorrect(file)) {
                const fileReader = new FileReader();

                fileReader.addEventListener('load', () => {
                    const image = new Image();

                    image.addEventListener('load', () => {
                        this.imageService.setImageAsBackground(image, imageArea);
                        resolve();
                    });

                    image.src = fileReader.result as string;
                });

                fileReader.readAsDataURL(file);
            } else {
                alert('Le système accepte seulement des images en format BMP 24-bit de taille 640x480.');
                reject();
            }
        });
    }

    private isImageTypeAndSizeCorrect(file: File) {
        return file.type === IMAGE_FILE_TYPE && file.size === IMAGE_SIZE;
    }
}
