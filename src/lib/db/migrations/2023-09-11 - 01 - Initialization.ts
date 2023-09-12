import { MigrationScript } from "../dbMigrations";
export const script: MigrationScript = {
    up: `

            CREATE TABLE _migrations (
                name TEXT NOT NULL PRIMARY KEY,
                executed_at timestamp with time zone NOT NULL
            );

        `,

    //----------------------------------------

    down: `

            DROP TABLE _migrations;

        `
};
