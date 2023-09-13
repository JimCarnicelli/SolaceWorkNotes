import { MigrationScript } from "./_allMigrations";
export const script: MigrationScript = {
up: `

CREATE TABLE _migrations (
    name TEXT NOT NULL PRIMARY KEY,
    executed_at timestamp with time zone NOT NULL
);

COMMENT ON TABLE _migrations IS
'Metadata table used to keep this database up to date with the latest migration scripts';

CREATE UNIQUE INDEX IF NOT EXISTS ix__migrations__name
ON _migrations (name);

`,
//################################################################################
down: `

DROP TABLE _migrations;

`};
