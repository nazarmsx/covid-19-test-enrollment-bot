const generator = require('generate-password');
import { injectable } from "tsyringe";
import { createAdminUser } from "./create.password.command"

@injectable()
export class PasswordService {
    generatePassword() {
        return generator.generate({
            length: 12,
            numbers: true
        });
    }

    private dummy() {
        createAdminUser('test', 'test').then(data => {
            console.log('Admin created')
        }).catch(er => {
            console.error(er)
        });
    }
}

