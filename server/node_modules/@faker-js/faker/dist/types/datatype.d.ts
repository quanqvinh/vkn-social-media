import type { Faker } from '.';
/**
 * Module to generate various primitive values and data types.
 */
export declare class Datatype {
    private readonly faker;
    constructor(faker: Faker);
    /**
     * Returns a single random number between zero and the given max value or the given range with the specified precision.
     * The bounds are inclusive.
     *
     * @param options Maximum value or options object.
     * @param options.min Lower bound for generated number. Defaults to `0`.
     * @param options.max Upper bound for generated number. Defaults to `min + 99999`.
     * @param options.precision Precision of the generated number. Defaults to `1`.
     *
     * @throws When options define `max < min`.
     *
     * @example
     * faker.datatype.number() // 55422
     * faker.datatype.number(100) // 52
     * faker.datatype.number({ min: 1000000 }) // 431433
     * faker.datatype.number({ max: 100 }) // 42
     * faker.datatype.number({ precision: 0.01 }) // 64246.18
     * faker.datatype.number({ min: 10, max: 100, precision: 0.01 }) // 36.94
     */
    number(options?: number | {
        min?: number;
        max?: number;
        precision?: number;
    }): number;
    /**
     * Returns a single random floating-point number for the given precision or range and precision.
     *
     * @param options Precision or options object.
     * @param options.min Lower bound for generated number. Defaults to `0`.
     * @param options.max Upper bound for generated number. Defaults to `99999`.
     * @param options.precision Precision of the generated number. Defaults to `0.01`.
     *
     * @example
     * faker.datatype.float() // 51696.36
     * faker.datatype.float(0.1) // 52023.2
     * faker.datatype.float({ min: 1000000 }) // 212859.76
     * faker.datatype.float({ max: 100 }) // 28.11
     * faker.datatype.float({ precision: 0.1 }) // 84055.3
     * faker.datatype.float({ min: 10, max: 100, precision: 0.001 }) // 57.315
     */
    float(options?: number | {
        min?: number;
        max?: number;
        precision?: number;
    }): number;
    /**
     * Returns a Date object using a random number of milliseconds since
     * the [Unix Epoch](https://en.wikipedia.org/wiki/Unix_time) (1 January 1970 UTC).
     *
     * @param options Max number of milliseconds since unix epoch or options object
     * @param options.min Lower bound for milliseconds since base date.
     *    When not provided or smaller than `-8640000000000000`, `1990-01-01` is considered
     *    as minimum generated date. Defaults to `633880849813`.
     * @param options.max Upper bound for milliseconds since base date.
     *    When not provided or larger than `8640000000000000`, `2100-01-01` is considered
     *    as maximum generated date.
     */
    datetime(options?: number | {
        min?: number;
        max?: number;
    }): Date;
    /**
     * Returns a string containing UTF-16 chars between 33 and 125 (`!` to `}`).
     *
     * @param length Length of the generated string. Max length is `2^20`. Defaults to `10`.
     *
     * @example
     * faker.datatype.string() // 'Zo!.:*e>wR'
     * faker.datatype.string(5) // '6Bye8'
     */
    string(length?: number): string;
    /**
     * Returns a UUID v4 ([Universally Unique Identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier)).
     *
     * @example
     * faker.datatype.uuid() // '4136cd0b-d90b-4af7-b485-5d1ded8db252'
     */
    uuid(): string;
    /**
     * Returns the boolean value true or false.
     *
     * @example
     * faker.datatype.boolean() // false
     */
    boolean(): boolean;
    /**
     * Returns a [hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal) number.
     *
     * @param length Length of the generated number. Defaults to `1`.
     *
     * @see faker.datatype.hexadecimal()
     *
     * @example
     * faker.datatype.hexaDecimal() // '0xb'
     * faker.datatype.hexaDecimal(10) // '0xaE13F044fb'
     *
     * @deprecated
     */
    hexaDecimal(length?: number): string;
    /**
     * Returns a [hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal) number.
     *
     * @param length Length of the generated number. Defaults to `1`.
     *
     * @example
     * faker.datatype.hexadecimal() // '0xb'
     * faker.datatype.hexadecimal(10) // '0xaE13F044fb'
     */
    hexadecimal(length?: number): string;
    /**
     * Returns a string representing JSON object with 7 pre-defined properties.
     *
     * @example
     * faker.datatype.json() // `{"foo":"mxz.v8ISij","bar":29154,"bike":8658,"a":"GxTlw$nuC:","b":40693,"name":"%'<FTou{7X","prop":"X(bd4iT>77"}`
     */
    json(): string;
    /**
     * Returns an array with random strings and numbers.
     *
     * @param length Size of the returned array. Defaults to `10`.
     *
     * @example
     * faker.datatype.array() // [ 94099, 85352, 'Hz%T.C\\l;8', '|#gmtw3otS', '2>:rJ|3$&d', 56864, 'Ss2-p0RXSI', 51084, 2039, 'mNEU[.r0Vf' ]
     * faker.datatype.array(3) // [ 61845, 'SK7H$W3:d*', 'm[%7N8*GVK' ]
     */
    array(length?: number): Array<string | number>;
    /**
     * Returns a [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#bigint_type) number.
     *
     * @param value When provided, this method simply converts it to `BigInt` type.
     *
     * @example
     * faker.datatype.bigInt() // 8507209999914928n
     * faker.datatype.bigInt('156') // 156n
     * faker.datatype.bigInt(30) // 30n
     * faker.datatype.bigInt(3000n) // 3000n
     * faker.datatype.bigInt(true) // 1n
     */
    bigInt(value?: string | number | bigint | boolean): bigint;
}
