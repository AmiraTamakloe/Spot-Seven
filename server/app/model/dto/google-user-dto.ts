/* eslint-disable max-params */
export class GoogleUserDto {
    firstName: string;
    lastName: string;
    password?: string;
    email: string;
    username?: string;
    idToken: string;

    constructor(firstName: string, username: string, password: string, email: string, lastName: string, idToken: string) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.idToken = idToken;
    }
}
