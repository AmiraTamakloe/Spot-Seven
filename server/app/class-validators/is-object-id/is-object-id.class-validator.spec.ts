import { IsObjectIdConstraint } from './is-object-id.class-validator';

describe('GameSessionGateway', () => {
    let isObjectIdConstraint: IsObjectIdConstraint;

    beforeEach(async () => {
        isObjectIdConstraint = new IsObjectIdConstraint();
    });

    it('IsObjectIdConstraint.validate() should check if property is a valid ObjectId', () => {
        expect(isObjectIdConstraint.validate(0)).toEqual(false);
        expect(isObjectIdConstraint.validate('yuigfdertyyuigfdertydfve')).toEqual(false);
        expect(isObjectIdConstraint.validate('abcdefabcdef1234567890aa')).toEqual(true);
    });

    it('IsObjectIdConstraint.defaultMessage() should return the default message', () => {
        expect(isObjectIdConstraint.defaultMessage()).toEqual('$property must be a valid ObjectId (24 hexadecimal chars)');
    });
});
