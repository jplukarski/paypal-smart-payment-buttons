import { getFieldErrors } from "../interface";
import { CARD_ERRORS } from "../constants";

describe('getFieldErrors', () => {
let fields;
beforeEach(()=> {
    fields = {
        cardCvvField: {
        isValid : false,
        isEmpty : false,
        isPotentiallyValid: false,
        isFocused: true
    },
    cardNumberField: {
        isValid : false,
        isEmpty : false,
        isPotentiallyValid: false,
        isFocused: true
    },
    cardExpiryField: {
        isValid : false,
        isEmpty : false,
        isPotentiallyValid: false,
        isFocused: true
    },
    cardNameField: {
        isValid : false,
        isEmpty : false,
        isPotentiallyValid: false,
        isFocused: true
    },
    cardPostalField: {
        isValid : false,
        isEmpty : false,
        isPotentiallyValid: false,
        isFocused: true
    }
}
})
    it('returns an array with invalid error for each field name', () => {
        expect(getFieldErrors(fields).sort()).toEqual(["INVALID_CVV", "INVALID_NUMBER", "INVALID_EXPIRY", "INVALID_NAME", "INVALID_POSTAL"].sort());
    })
    it('returns an empty array when no fields are passed', () => {
        Object.keys(fields).forEach(field => fields[field].isValid = true);
        expect(getFieldErrors(fields)).toStrictEqual([])
    })
    it('returns an array with invalid error only for invalid fields', () => {
        fields.cardNameField.isValid = true;
        fields.cardCvvField.isValid = true;

        expect(getFieldErrors(fields).sort()). toEqual(["INVALID_NUMBER", "INVALID_EXPIRY", "INVALID_POSTAL"].sort());
    })

})