import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { avatarsUrl } from '@app/constants/avatars-url';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { ModalService } from '@app/services/modal/modal.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrl: './avatar.component.scss',
})
export class AvatarComponent implements OnInit {
    user!: UserInfo;
    currentAvatar!: string;
    avatarForm: FormGroup = this.formBuilder.group({
        username: [''],
        avatar: [''],
    });
    avatarsUrl: { url: string; name: string }[] = avatarsUrl;

    // eslint-disable-next-line max-params
    constructor(
        private formBuilder: FormBuilder,
        private accountService: AccountService,
        private modalService: ModalService,
        private readonly translocoService: TranslocoService,
    ) {}
    ngOnInit(): void {
        this.accountService.getUser().subscribe((user) => {
            this.user = user as UserInfo;
            this.avatarForm.get('username')?.setValue(this.user.username);
            this.avatarForm.get('avatar')?.setValue(this.user.avatar);
            if (this.avatarsUrl.some((avatar) => avatar.name === this.user.avatar)) {
                this.currentAvatar = `./assets/avatar/${this.user.avatar}`;
            } else {
                if (this.user.avatar) {
                    this.accountService.getAvatarUrl(this.user.avatar).subscribe((res) => {
                        this.currentAvatar = `data:image/png;base64,${res}`;
                    });
                }
            }
        });
    }

    selectAvatar(name: string): void {
        this.currentAvatar = `./assets/avatar/${name}`;
        this.avatarForm.get('avatar')?.setValue(name);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFileSelected(event: any): void {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.currentAvatar = reader.result as string;
            const base64Data = (reader.result as string).substring('data:image/png;base64,'.length);
            this.avatarForm.get('avatar')?.setValue(base64Data);
        };
    }

    onSubmit(): void {
        let disconnectMessage = '';
        if (this.avatarForm.value.username !== this.user.username) {
            disconnectMessage = this.translocoService.translate('avatar.Déconnecter le compte');
        }
        this.user = { ...this.user, username: this.avatarForm.value.username, avatar: this.avatarForm.value.avatar };
        this.accountService.updateAccountParameters(this.user).subscribe({
            next: (response) => {
                this.user = response;
                if (this.avatarsUrl.some((avatar) => avatar.name === response.avatar)) {
                    this.currentAvatar = `./assets/avatar/${response.avatar}`;
                } else {
                    if (response.avatar) {
                        this.accountService.getAvatarUrl(response.avatar).subscribe((res) => {
                            this.currentAvatar = `data:image/png;base64,${res}`;
                        });
                    }
                }
                const message = this.translocoService.translate('avatar.mise à jour avec succès');
                this.modalService.createInformationModal(this.translocoService.translate('avatar.Bravo'), `${message} ${disconnectMessage}`, 'OK');
                this.accountService.logOut();
                return response;
            },
            error: () => {
                this.modalService.createInformationModal(
                    this.translocoService.translate('avatar.Erreur'),
                    this.translocoService.translate("avatar.Essayez peut-être un nouveau nom d'utilisateur ?"),
                    'OK',
                );
            },
        });
    }
}
