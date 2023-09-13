import { DbTable } from '@/lib/db/dbServer';
import { Guid } from '@/lib/db/dbShared';

export const currentUserId: Guid = 'acf4adb2-1397-47a7-92ae-8336b22556e6';

/** One database table definition */

export type UserRow = {
    id?: Guid,
    name?: string,
    created_at?: Date,
    updated_at?: Date,
    deleted?: boolean,

    // Derived columns
    started_at?: Date,
    latest_at?: Date,
}

/** Users are people who can log in and do stuff */
export const UserTable: DbTable<UserRow> = {
    table: 'user_',
    titleCol: 'name',
    sortOrder: ['name'],
    deletedFlag: true,
    populateOnInsert: {
        id: 'uuid',
        created_at: 'now',
        updated_at: 'now',
    },
    populateOnUpdate: {
        updated_at: 'now',
    },
}
