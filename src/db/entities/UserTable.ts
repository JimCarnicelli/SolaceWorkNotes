import { DbTable } from '@/db/dbServer';
import { Guid } from '@/db/dbShared';

/** One database table definition */

export type UserRow = {
    id?: Guid,
    name?: string,
    created_at?: Date,
    update_at?: Date,
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
        update_at: 'now',
    },
    populateOnUpdate: {
        update_at: 'now',
    },
}
