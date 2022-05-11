import { Faker } from './faker';
export type { AddressDefinitions, AnimalDefinitions, CommerceDefinitions, CommerceProductNameDefinitions, CompanyDefinitions, DatabaseDefinitions, DateDefinitions, DateEntryDefinition, DefinitionTypes, FinanceCurrencyEntryDefinitions, FinanceDefinitions, HackerDefinitions, InternetDefinitions, LocaleDefinition, LoremDefinitions, MusicDefinitions, NameDefinitions, NameTitleDefinitions, PhoneNumberDefinitions, SystemDefinitions, SystemMimeTypeEntryDefinitions, VehicleDefinitions, WordDefinitions, } from './definitions';
export { FakerError } from './errors/faker-error';
export type { FakerOptions, UsableLocale, UsedLocales } from './faker';
export { Gender } from './name';
export type { GenderType } from './name';
export { Faker };
export declare const faker: Faker;
export default faker;
