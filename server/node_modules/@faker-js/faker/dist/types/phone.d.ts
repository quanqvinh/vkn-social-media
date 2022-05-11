import type { Faker } from '.';
/**
 * Module to generate phone-related data.
 */
export declare class Phone {
    private readonly faker;
    constructor(faker: Faker);
    /**
     * Generates a random phone number.
     *
     * @param format Format of the phone number. Defaults to `faker.phone.phoneFormats()`.
     *
     * @example
     * faker.phone.phoneNumber() // '961-770-7727'
     * faker.phone.phoneNumber('501-###-###') // '501-039-841'
     * faker.phone.phoneNumber('+48 91 ### ## ##') // '+48 91 463 61 70'
     */
    phoneNumber(format?: string): string;
    /**
     * Returns phone number in a format of the given index from `faker.definitions.phone_number.formats`.
     *
     * @param phoneFormatsArrayIndex Index in the `faker.definitions.phone_number.formats` array. Defaults to `0`.
     *
     * @example
     * faker.phone.phoneNumberFormat() // '943-627-0355'
     * faker.phone.phoneNumberFormat(3) // '282.652.3201'
     */
    phoneNumberFormat(phoneFormatsArrayIndex?: number): string;
    /**
     * Returns a random phone number format.
     *
     * @example
     * faker.phone.phoneFormats() // '!##.!##.####'
     */
    phoneFormats(): string;
    /**
     * Generates IMEI number.
     *
     * @example
     * faker.phone.imei() // '13-850175-913761-7'
     */
    imei(): string;
}
