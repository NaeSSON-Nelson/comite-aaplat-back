import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsValidName(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'isValidName',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            // Expresión regular actualizada para permitir minúsculas
            const nameRegex = /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ]+([.]|[A-Za-záéíóúüñÁÉÍÓÚÜÑ]*)?[ ]([A-Za-záéíóúüñÁÉÍÓÚÜÑ]([.]|[A-Za-záéíóúüñÁÉÍÓÚÜÑ]+))?[ ]?([A-Za-záéíóúüñÁÉÍÓÚÜÑ]+([.]|[A-Za-záéíóúüñÁÉÍÓÚÜÑ]*))?$/;
            return typeof value === 'string' && nameRegex.test(value);
          },
          defaultMessage(args: ValidationArguments) {
            return `${args.property} debe ser un nombre válido (Ejemplos: maria garcia, Jose A. gonzalez, juan C. Perez garcia)`;
          }
        }
      });
    };
  }
  