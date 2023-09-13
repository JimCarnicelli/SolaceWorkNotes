import { dbCore } from '@/lib/db/dbServer';

/**
 * Simplified database migration script engine
 * 
 * The scripts are imported at the bottom of this file for simplicity. Place a
 * stopHere() function call anywhere in that statement list to prevent forward 
 * execution of 'up' scripts. But also to roll back any scripts after it that were 
 * previously executed using the 'down' versions of those scripts.
 * 
 */
export async function runMigrationScripts() {
    console.log('- Running migration scripts');
    const scriptNames = Object.keys(migrationScripts);
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
    if (lastScript !== '')
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
    if (lastScript !== '' && !migrationNames.find(name => name === lastScript)) return;

    for (let i = migrationNames.length - 1; i >= 0; i--) {
        const scriptName = migrationNames[i];
        if (scriptName === lastScript) return;  // Don't go back any farther

        const script = migrationScripts[scriptName];
        if (!script) {
            console.log(`- Migration script not found to roll back: '${scriptName}'`);
            continue;
        }

        const sql = script.down;
        try {
            console.log(`- Rolling back migration '${scriptName}'`);
            await dbCore.query(sql);
            if (i > 0) {  // There won't be a _migrations table after we roll back the first script
                await dbCore.query(`
                    DELETE FROM _migrations
                    WHERE name = ${dbCore.safeValue(scriptName)}
                `);
            }
        } catch (err: any) {
            console.error(`Error in DB script '${scriptName}':`, err);
            return;
        }

    }
}

/** Roll updates forward until 'STOP HERE' marker */
async function rollForward(lastScript: string, initialScriptExecuted: boolean) {
    const scriptNames = Object.keys(migrationScripts);

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

            const sql = migrationScripts[scriptName]!.up;
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

export type MigrationScript = {
    /** Run this to apply this script's changes */
    up: string,
    /** Run this to un-apply this script's changes */
    down: string,
}

export type MigrationScriptSeries = { [name: string]: MigrationScript | undefined }

/** Sequence of database scripts to apply to the database to bring it up to the current version */
let migrationScripts: MigrationScriptSeries = {};

/** Import the given script and add it to the series */
function addScript(name: string) {
    const script: MigrationScript = require('@/lib/db/migrations/' + name).script;
    migrationScripts[name] = script;
}

/** Migrations should not go forward past this and should roll backward to this */
function stopHere() {
    migrationScripts['STOP HERE'] = undefined;
}


//----- Register all scripts here in the order they should execute -----//
addScript('2023-09-11 - 01 - Initialization');
addScript('2023-09-11 - 02 - First tables');
addScript('2023-09-12 - 01 - Sample data');
stopHere();
