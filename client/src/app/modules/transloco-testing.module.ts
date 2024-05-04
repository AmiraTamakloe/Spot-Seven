// FIXME: fix the disable no pattern import

/* eslint-disable no-restricted-imports */
import { TranslocoTestingModule, TranslocoTestingOptions } from '@ngneat/transloco';
import { TranslocoLocaleModule } from '@ngneat/transloco-locale';

import en from '../../assets/i18n/en.json';
import es from '../../assets/i18n/es.json';
import fr from '../../assets/i18n/fr.json';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function getTranslocoTestingModules(options: TranslocoTestingOptions = {}) {
    return [
        TranslocoTestingModule.forRoot({
            langs: {
                en,
                fr,
                es,
            },
            translocoConfig: {
                availableLangs: ['en', 'fr', 'es'],
                defaultLang: 'fr',
            },
            preloadLangs: true,
            ...options,
        }),
        TranslocoLocaleModule,
    ];
}
