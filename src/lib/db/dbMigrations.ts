import { dbCore } from "./dbServer";

/**
 * Simplified database migration script engine
 * 
 * The scripts are just hard-coded at the bottom of this file for simplicity. Place a
 * 'STOP HERE':undefined element anywhere in that list (object) to prevent forward 
 * execution of 'up' scripts. But also to roll back any scripts after it that were 
 * previously executed using the 'down' versions of those scripts.
 * 
 * */
export async function runMigrationScripts() {
    const scriptNames = Object.keys(databaseScripts);
    let lastScript = '';

    for (let i = 0; i < scriptNames.length; i++) {
        const scriptName = scriptNames[i];
        if (scriptName === 'STOP HERE') break;
        lastScript = scriptName;
    }

    const initialScriptExecuted = (await dbCore.queryScalar(`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '_migrations'
    `)) === 1;

    await rollBackward(lastScript, initialScriptExecuted);
    await rollForward(lastScript, initialScriptExecuted);
}

/** Roll updates backward to the last active script before 'STOP HERE' */
async function rollBackward(lastScript: string, initialScriptExecuted: boolean) {
    if (!initialScriptExecuted) return;  // Can't roll back if there is no _migrations table

    const migrationNames: string[] = (await dbCore.queryTable(`
        SELECT name
        FROM _migrations
    `) as any)
        .map((row: any) => row.name);

    // If we can't find the last script in the current list then we haven't 
    // updated to that point yet. No scripts need to be rolled back.
    if (!migrationNames.find(name => name === lastScript)) return;

    for (let i = migrationNames.length - 1; i >= 0; i--) {
        const scriptName = migrationNames[i];
        if (scriptName === lastScript) return;  // Don't go back any farther

        const script = databaseScripts[scriptName];
        if (!script) {
            console.log(`- Migration script not found to roll back: '${scriptName}'`);
            continue;
        }

        const sql = script.down;
        try {
            console.log(`- Rolling back migration '${scriptName}'`);
            await dbCore.query(sql);
            await dbCore.query(`
                DELETE FROM _migrations
                WHERE name = ${dbCore.safeValue(scriptName)}
            `);
        } catch (err: any) {
            console.error(`Error in DB script '${scriptName}':`, err);
            return;
        }

    }
}

/** Roll updates forward until 'STOP HERE' marker */
async function rollForward(lastScript: string, initialScriptExecuted: boolean) {
    const scriptNames = Object.keys(databaseScripts);

    for (let i = 0; i < scriptNames.length; i++) {
        const scriptName = scriptNames[i];

        let scriptExecuted: boolean = false;
        if (i === 0) {
            scriptExecuted = initialScriptExecuted;
        } else {
            // Subsequent scripts rely on a registry of scripts that have already been executed
            scriptExecuted = (await dbCore.queryScalar(`
                SELECT 1 FROM _migrations
                WHERE name = ${dbCore.safeValue(scriptName)}
            `)) === 1;
        }
        if (!scriptExecuted) {

            const sql = databaseScripts[scriptName]!.up;
            try {
                console.log(`- Rolling forward migration script '${scriptName}'`);
                await dbCore.query(sql);
                await dbCore.query(`
                    INSERT INTO _migrations (
                        name, executed_at
                    ) VALUES (
                        ${dbCore.safeValue(scriptName)},
                        ${dbCore.safeValue(new Date())}
                    )
                `);
            } catch (err: any) {
                console.error(`Error in DB script '${scriptName}':`, err);
                return;
            }

        }
        // Don't execute past this one
        if (scriptName === lastScript) return;
    }
}

type MigrationScript = {
    /** Run this to apply this script's changes */
    up: string,
    /** Run this to un-apply this script's changes */
    down: string,
}

/** Sequence of database scripts to apply to the database to bring it up to the current version */
const databaseScripts: { [key: string]: MigrationScript | undefined } = {

    //--------------------------------------------------------------------------------
    '2023-09-11 - Initialization': {
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
    },

    //'STOP HERE': undefined,  // Every script after this will be ignored

    //--------------------------------------------------------------------------------
    '2023-09-11 - First tables': {
        up: `

            CREATE TABLE user_ (
                id UUID NOT NULL,
                name CHARACTER VARYING(100) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                update_at TIMESTAMP WITH TIME ZONE NOT NULL,
                deleted boolean NOT NULL DEFAULT false
            );

            INSERT INTO user_ (
                id, name, created_at, update_at
            ) VALUES (
                'acf4adb2-1397-47a7-92ae-8336b22556e6',
                'Caregiving Cathy',
                '2023-09-11 21:15:38.063838-04',
                '2023-09-11 21:15:38.063838-04'
            );

        `,
        //----------------------------------------
        down: `

            DROP TABLE user_;

        `
    },

    'STOP HERE': undefined,  // Roll forward or backward to this point

};
