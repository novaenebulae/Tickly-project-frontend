import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

/**
 * Validateur personnalisé qui vérifie si les champs 'password' et 'confirmPassword' correspondent
 * @returns Une fonction de validation qui renvoie null si les mots de passe correspondent,
 * ou { passwordMismatch: true } s'ils ne correspondent pas
 */
export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Ne pas valider si l'un des champs n'existe pas ou n'a pas de valeur
  if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
    return null;
  }

  // Vérifier si les mots de passe correspondent
  return password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
};
