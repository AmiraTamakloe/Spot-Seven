import { NgModule } from '@angular/core';
import { provideTransloco, TranslocoModule } from '@ngneat/transloco';
import { environment } from 'src/environments/environment';
import { TranslocoHttpLoader } from './transloco-loader';

@NgModule({
    exports: [TranslocoModule],
    providers: [
        provideTransloco({
            config: {
                availableLangs: ['fr', 'en', 'es'],
                defaultLang: 'fr',
                fallbackLang: 'fr',
                // Remove this option if your application doesn't support changing language in runtime.
                reRenderOnLangChange: true,
                prodMode: environment.production,
            },
            loader: TranslocoHttpLoader,
        }),
    ],
})
export class TranslocoRootModule {}
