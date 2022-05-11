/**
 * The possible definitions related to databases.
 */
export interface DatabaseDefinitions {
    /**
     * Database Engine
     */
    engine: string[];
    /**
     * Database Collation
     */
    collation: string[];
    /**
     * Column names
     */
    column: string[];
    /**
     * Column types
     */
    type: string[];
}
/**
 * Internal: A list of all keys for the DatabaseDefinitions.
 */
export declare const DATABASE: ["collation", "column", "engine", "type"];
