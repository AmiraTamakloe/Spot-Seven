import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@ngneat/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
    async getTranslation(lang: string) {
        return fetch(`./assets/i18n/${lang}.json`).then<Translation>(async (res) => res.json());
    }
}
