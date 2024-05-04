import { isHexadecimal, registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

const OBJECT_ID_LENGTH = 24;

@ValidatorConstraint()
export class IsObjectIdConstraint implements ValidatorConstraintInterface {
    validate = (property: unknown) => {
        return typeof property === 'string' && isHexadecimal(property) && property.length === OBJECT_ID_LENGTH;
    };

    defaultMessage = () => '$property must be a valid ObjectId (24 hexadecimal chars)';
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsObjectId = (validationOptions?: ValidationOptions) => {
    return (object: object, propertyName: string) => {
        registerDecorator({
            name: 'isObjectId',
            target: object.constructor,
            propertyName,
            constraints: [],
            options: { ...validationOptions },
            validator: IsObjectIdConstraint,
        });
    };
};
