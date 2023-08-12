import { FormGroup } from "@angular/forms";

export function SamePasswordValidator() {
    return (group: FormGroup): { [key: string]: any } | null => {

        if (group.controls['password'].valid) {

            let password = group.controls['password'].value || null;
            let confirmPassword = group.controls['confirmPassword'].value || null;

            if (password !== confirmPassword) {
                return { SamePasswordValidation: true };
            } else {
                return null;
            }

        } else {
            return null;
        }
    };
}