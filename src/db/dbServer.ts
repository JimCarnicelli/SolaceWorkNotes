import { Pool, PoolConfig } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { DbRow, DbSet, PagedRowset } from './dbShared';
import { format as formatSql } from 'sql-formatter';
export type DbTableName<T> = string | DbTable<T>;
export type DbSortOrder<T> = string | (keyof T)[] | string[];  // Eg 'name' for ASC or 'name!' for DESC
export type DbColumnExpressions<T> = { [colName in keyof T]: string };

export type DbGetColumn<T> = (keyof T) | DbColumnExpression | DbColumnLookup<T>;

export type DbValueProcessor = (value: any) => Promise<any>;

export type DbColumnExpression = {
    isDbColumnExpression: boolean,
    outCol: string,
    expr: string,
    postProcess?: DbValueProcessor,
}

export type DbColumnLookup<T> = {
    isDbColumnLookup: boolean,
    dbTable: DbTable<T>,
    fkCol: string,
    outCol: string,
    sourceCol?: keyof T,
}

export type DbTable<T> = {
    table: string,  // Name of the table in the database
    pkCol?: keyof T,
    titleCol?: keyof T,
    sortOrder?: DbSortOrder<T>,
    deletedFlag?: boolean,  // T.deleted column exists on the table
    populateOnInsert?: DbColumnExpressions<T>,
    populateOnUpdate?: DbColumnExpressions<T>,
}

export class Db {

    name: string;

    conn: Pool | undefined;

    constructor(name: string) {
        this.name = name;
    }

    /** Connect to the database or use an existing connection */
    async getConn(): Promise<Pool> {
        if (!this.conn) {
            const dbConfig: PoolConfig = {
                host: process.env[this.name + '_DB_HOST'],
                port: +(process.env[this.name + '_DB_PORT'] ?? 0) ?? undefined,
                user: process.env[this.name + '_DB_USER'],
                password: process.env[this.name + '_DB_PASSWORD'],
                database: process.env[this.name + '_DB_DATABASE'],
            };
            this.conn = new Pool(dbConfig);
        }
        return this.conn;
    }

    /**
     * Execute the SQL against the database and return the raw output
     */
    async query(sql: string, params?: any[]): Promise<any> {
        const conn = await this.getConn();
        //console.log(sql);
        try {
            const results = await conn.query(sql, params);
            return results;
        } catch (err: any) {
            throw new Error('SQL error: ' + (err.message ?? err.toString()) + ':\n\n' + formatSql(sql, {
                language: 'postgresql'
            }));
        }
    }

    /**
     * Fetch one or more rowsets (tables) from this database and optionally 
     * name them
     * 
     * To name an output table in your SQL, Add a SELECT statement like in 
     * the following example:
     * 
     *     SELECT 'AllUsers' AS _name;
     *     SELECT * FROM user;
     * 
     *     SELECT 'ProductList' AS _name;
     *     SELECT * FROM product;
     * 
     * The result will be an object with a 'AllUsers' key and a 'ProductList' 
     * key for each of the actual data tables.
     * 
     * Any output rowset that is not named this way will be named as 't0', 't1', 
     * 't2', and so on. If the first table (index 0) is named but the second 
     * (index 1) is not, the second will be named 't1' instead of 't0'.
     * 
     * Calls to INSERT, DELETE, etc will add output tables with zero rows. You 
     * could name them in the same manner. But there's probably no benefit most 
     * of the time.
     * 
     * Naming your tables is the best practice for complex queries because changes 
     * over time to the SQL may cause the table sequence to change. Queries with 
     * conditional logic may also result in unpredictable table sequences. Naming 
     * solves this.
     */
    async queryTables(sql: string, params?: any[]): Promise<DbSet> {
        let tableList = await this.query(sql, params);
        let namedTables: DbSet = {};

        if (!Array.isArray(tableList))
            tableList = [tableList];

        let tableName: string | undefined;
        let tableIndex = 0;
        for (let i = 0; i < tableList.length; i++) {
            const table = tableList[i];
            if (table.fields.length === 1 && table.fields[0].name === '_name') {
                tableName = table.rows[0]._name;
            } else {
                namedTables[tableName ?? 't' + tableIndex] = table.rows;
                tableName = undefined;
                tableIndex++;
            }
        }

        return namedTables;
    }

    /**
     * Fetch a single table from the database
     * 
     * See .queryTables() for details about structuring your SQL to name the 
     * output tables. If you don't pass in the nameOrIndex argument you'll 
     * get the first out table returned by querying. If it is a numeric value 
     * then you'll get that item (0, 1, 2, etc). Otherwise you are naming the 
     * table you want.
     */
    async queryTable<T>(sql: string, params?: any[], nameOrIndex?: string | number): Promise<T[]> {
        const namedSets = await this.queryTables(sql, params);
        let table: DbRow[];

        if (!nameOrIndex || (nameOrIndex as number).toExponential) {  // Numeric index
            table = namedSets[Object.keys(namedSets)[nameOrIndex as number ?? 0]];
        } else {  // Name
            table = namedSets[nameOrIndex as string];
        }
        if (!table)
            throw new Error(`No such table as '${nameOrIndex ?? 0}'`);
        return table as T[];
    }

    /** Fetch a single row from the database */
    async queryRow<T>(sql: string, params?: any[], nameOrIndex?: string | number): Promise<T | undefined> {
        const rows = await this.queryTable(sql, params, nameOrIndex);
        if (!rows.length) return undefined;
        return rows[0] as T;
    }

    /** Fetch a single scalar value from the database */
    async queryScalar<T>(sql: string, params?: any[], nameOrIndex?: string | number): Promise<T | undefined> {
        const row = await this.queryRow<DbRow>(sql, params, nameOrIndex);
        if (!row) return undefined;
        const keys = Object.keys(row);
        return row[keys[0]] as T;
    }

    colExpr(outCol: string, expr: string, postProcess?: DbValueProcessor): DbColumnExpression {
        return {
            isDbColumnExpression: true,
            outCol, expr, postProcess: postProcess,
        }
    }

    allColumns(prefix?: string): DbColumnExpression {
        return {
            isDbColumnExpression: true,
            outCol: prefix ?? '*',
            expr: '*',
        }
    }

    lookupCol<T, U>(
        dbTable: DbTable<T>,
        fkCol?: keyof U,
        outCol?: string,
        sourceCol?: keyof T,
    ): DbColumnLookup<T> {
        if (!sourceCol) sourceCol = dbTable.titleCol;
        if (!sourceCol)
            throw new Error(dbTable.table + ' table definition is missing a .titleCol property');
        return {
            isDbColumnLookup: true,
            dbTable: dbTable,
            fkCol: fkCol as string ?? `${dbTable.table}_id`,
            outCol: outCol ?? (dbTable.table + '_' + (sourceCol as string)).replace(/__/, '_'),
            sourceCol: sourceCol,
        };
    }

    /** Fetch a single table from the database */
    async getTable<T>(params: {
        table: DbTableName<T>,
        joins?: string,
        where?: T | string,
        alsoWhere?: string,
        includeDeleted?: boolean,
        order?: DbSortOrder<T>,
        columns?: DbGetColumn<T>[],
        skip?: number
        take?: number,
        withCount?: boolean,
        debug?: boolean,
    }): Promise<PagedRowset<T>> {
        let { table, joins, where, alsoWhere, includeDeleted, order, columns, skip, take, withCount } = params;

        const colDefs = columns ? columns.filter(c => !!c).map(col => {

            // It might be a raw SQL snippet
            const ce = col as DbColumnExpression;
            if (ce.isDbColumnExpression) {
                if (ce.expr === '*' && ce.outCol === '*') {
                    return '*';
                } else if (ce.expr === '*') {
                    return this.safeName(ce.outCol) + '.*';
                } else {
                    return `(${ce.expr}) AS ${this.safeName(ce.outCol)}`;
                }
            }

            // It might be a lookup column definition
            const lu = col as DbColumnLookup<T>;
            if (lu.isDbColumnLookup) {
                const sourceCol = lu.sourceCol ?? lu.dbTable.titleCol;
                const subSql = `(SELECT ${this.safeName(sourceCol as string)} FROM ${this.safeName(lu.dbTable.table)} WHERE ${this.safeName((lu.dbTable.pkCol as string) ?? 'id')} = t.${this.safeName(lu.fkCol as string)})`;
                return `${subSql} AS ${this.safeName(lu.outCol)}`;
            }

            // It must be the name of a column actually in the table
            return `t.${this.safeName(col as string)}`;

        }) : [];

        const whereClause = this.filtersToWhere(where, alsoWhere, includeDeleted, table, 't', false, '');
        if (order === undefined) {
            order = (table as DbTable<T>).sortOrder;
        }
        let orderByClause: string | undefined = undefined;
        if (order) {
            if (typeof order === 'string') {
                orderByClause = order;
            } else {
                orderByClause = (order as string[])
                    ?.map(col => col.trimEnd()[col.trimEnd().length - 1] === '!'  // Eg 'name!' for descending
                        ? this.safeName(col.trimEnd().substring(0, col.trimEnd().length - 1)) + ' DESC'
                        : this.safeName(col) + ' ASC'
                    )
                    .join(', ');
            }
        }
        const limitClause = take ? `LIMIT ${+take}` : '';
        const offsetClause = skip ? `OFFSET ${+skip}` : '';

        const coreSql =
            `FROM ${this.safeName(table)} t
${joins ?? ''}
WHERE ${whereClause}`;

        let sql = `
SELECT ${columns ? colDefs.join(', ') : '*'
            }
${coreSql}
${orderByClause ? 'ORDER BY ' + orderByClause : ''}
${limitClause} ${offsetClause}
`;
        if (params.debug) {
            try {
                console.log(
                    '----------\n' +
                    formatSql(sql, {
                        language: 'postgresql'
                    }) +
                    '\n----------'
                );
            } catch {  // formatSql() must have choked
                console.log(
                    '----------\n' +
                    sql +
                    '\n----------'
                );
            }
        }
        const rows = await this.queryTable(sql);

        let count: number | undefined = undefined;
        if (withCount) {
            count = +(await this.queryScalar(`
                SELECT COUNT(*)
                ${coreSql}
            `))!;
        }

        // Do we need to do any post-processing of the results?
        const colExpressions: DbColumnExpression[] = columns
            ?.filter((col: any) => col.isDbColumnExpression)
            .filter((col: any) => col.postProcess)
            .map((col: any) => col)
            ?? [];

        if (colExpressions.length) {  // Yes
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i] as DbRow;
                for (let j = 0; j < colExpressions.length; j++) {
                    const col = colExpressions[j];
                    let value = row[col.outCol];
                    value = await col.postProcess!(value);
                    row[col.outCol] = value;
                }
            }
        }

        return {
            rows: rows as T[],
            count: count,
        };
    }

    /** Fetch a single row from the database */
    async getRow<T>(params: {
        table: DbTableName<T>,
        joins?: string,
        where: T | string,
        alsoWhere?: string,
        includeDeleted?: boolean,
        order?: DbSortOrder<T>,
        columns?: DbGetColumn<T>[],
        debug?: boolean,
    }): Promise<T | undefined> {
        const rows = (await this.getTable<T>({ ...params, take: 1 })).rows;
        if (!rows.length) return undefined;
        return rows[0] as T;
    }

    /** Fetch a single scalar value from the database */
    async getScalar<T>(params: {
        table: DbTableName<T>,
        joins?: string,
        where: T | string,
        alsoWhere?: string,
        includeDeleted?: boolean,
        column?: DbGetColumn<T>,
        order?: DbSortOrder<T>,
        debug?: boolean,
    }): Promise<any> {
        const row = await this.getRow({
            ...params,
            columns: params.column ? [params.column] : undefined,
        }) as DbRow;
        if (!row) return undefined;
        const colName = (params.column as DbColumnExpression)?.outCol
            ?? (params.column as DbColumnLookup<T>)?.outCol
            ?? params.column;
        return row[colName ?? Object.keys(row)[0]] as T;
    }

    /** Add or update a single row in the given table and return it */
    async saveRow<T>(
        table: DbTableName<T>,
        where: T | string,
        alsoWhere: string | undefined,
        values: T,
        includeDeleted?: boolean
    ): Promise<T> {
        const count = await this.updateRows(table, where, alsoWhere, values, includeDeleted);
        if (count > 1) throw new Error(`db.saveRow() updated ${count} rows instead of just 1`);
        let row: T;
        if (count) {
            row = (await dbCore.getRow({ table, where, alsoWhere }) as T);
            return row;
        }
        row = await this.insertRow(table, values);
        return row;
    }

    /** Insert a single row into the given table and return whether it was successful */
    async insertRow<T>(
        table: DbTableName<T>,
        values: T
    ): Promise<T> {
        const dbTable = !!(table as DbTable<T>).table ? table as DbTable<T> : undefined;
        const populators = dbTable?.populateOnInsert;
        // Get column names from both the partial row and the populators if any
        let columns = [...Object.keys({ ...values as any, ...(populators as any ?? {}) })];
        const colNames = columns
            .map(colName => this.safeName(colName))
            .join(', ');
        const colValues = columns
            .map(colName => `/* ${colName} */  ${this.columnValue(colName as keyof T, values, populators)}`)
            .join(',\n    ');

        const sql = `
INSERT INTO ${this.safeName(table)} (
    ${colNames}
) VALUES (
    ${colValues}
);
`;
        await this.query(sql);
        return values;
    }

    /** Update rows from the given table and return the number updated */
    async updateRows<T>(
        table: DbTableName<T>,
        where: T | string,
        alsoWhere: string | undefined,
        values: T,
        includeDeleted?: boolean
    ): Promise<number> {
        const whereClause = this.filtersToWhere(where, alsoWhere, includeDeleted, table, undefined, true, '    ');
        const dbTable = !!(table as DbTable<T>).table ? table as DbTable<T> : undefined;
        const populators = dbTable?.populateOnUpdate;
        // Get column names from both the partial row and the populators if any
        let colNames = [...Object.keys({ ...values as any, ...(populators as any ?? {}) })];
        if (!colNames.length) throw new Error('No columns to update');
        const colUpdates = colNames
            .map(colName => `${this.safeName(colName)} = ${this.columnValue(colName as keyof T, values, populators)}`)
            .join(',\n        ');

        const sql = `
WITH rows AS (
    UPDATE ${this.safeName(table)} SET
        ${colUpdates}
    WHERE ${whereClause}
    RETURNING 1
) SELECT COUNT(*) FROM rows;
`;
        return await this.queryScalar(sql, []) as number;
    }

    /** Delete rows from the given table and return the number deleted */
    async deleteRows<T>(
        table: DbTableName<T>,
        where: T | string,
        alsoWhere?: string | undefined,
        includeDeleted?: boolean
    ): Promise<number> {
        const whereClause = this.filtersToWhere(where, alsoWhere, includeDeleted, table, undefined, true, '    ');

        const sql = `
WITH rows AS (
    DELETE FROM ${this.safeName(table)}
    WHERE ${whereClause}
    RETURNING 1
) SELECT COUNT(*) FROM rows;
`;
        return await this.queryScalar(sql, []) as number;
    }

    /** Translate an object of key/value pairs into a WHERE clause or return the string passed in */
    filtersToWhere<T>(
        filtersOrWhere: T | string | undefined,
        alsoWhere: string | undefined,
        includeDeleted: boolean | undefined,
        tableName: DbTableName<T>,
        columnPrefix: string | undefined,
        requireOne: boolean,
        indent: string
    ): string {
        if (!filtersOrWhere) {
            if (
                (tableName as DbTable<T>).table &&
                (tableName as DbTable<T>).deletedFlag
            ) {
                return 'deleted = false';
            }
            return alsoWhere ?? '1=1';
        }
        alsoWhere = alsoWhere
            ? '\n AND (' + alsoWhere + ')'
            : '';
        if ((filtersOrWhere as string).charAt) {  // This is already a WHERE clause string
            if (alsoWhere !== '') filtersOrWhere = '(\n' + filtersOrWhere as string + ')\n' + alsoWhere;

            // Get rid of any '1=1 AND' to remove unnecessary SQL that may slow down querying
            const whereClause = (filtersOrWhere as string).replace(/1\s*=\s*1[ \t\r\n]*AND/gi, '');
            return whereClause;
        }

        if (
            (tableName as DbTable<T>).table &&
            (tableName as DbTable<T>).deletedFlag &&
            (filtersOrWhere as any).deleted !== true &&
            !includeDeleted
        ) {
            (filtersOrWhere as any).deleted = false;
        }

        const filters = filtersOrWhere as DbRow;
        const colNames = Object.keys(filters);
        if (requireOne && !colNames.length) throw new Error('Expecting at least one column to filter by');
        let whereClause = colNames.map(colName => {
            const value = filters[colName];
            if (value === undefined || value === null)
                return `${columnPrefix ? columnPrefix + '.' : ''}${this.safeName(colName)} IS NULL`;
            return `${columnPrefix ? columnPrefix + '.' : ''}${this.safeName(colName)} = ${this.safeValue(value)}`;
        }).join('\n' + indent + 'AND ');
        if (whereClause === '') whereClause = '1=1';
        if (alsoWhere !== '') whereClause = '(\n' + whereClause + ')\n' + alsoWhere;

        // Get rid of any '1=1 AND' to remove unnecessary SQL that may slow down querying
        whereClause = whereClause.replace(/1\s*=\s*1[ \t\r\n]*AND/gi, '');
        return whereClause;
    }

    /** Get the column value from the source columns or automatic populator */
    columnValue<T>(col: keyof T, row: T, populators: DbColumnExpressions<T> | undefined) {
        //if (!populators || !populators[col]) return this.safeSqlValue(row[col] as any);
        if (Object.keys(row as any).find(e => e === col as string)) return this.safeValue(row[col] as any);
        const expr = populators![col];
        let value: any = undefined;
        switch (expr) {
            case 'uuid':
                value = uuidv4();
                row[col] = value;
                return '\'' + value + '\'';
            case 'now':
                value = new Date();
                row[col] = value;
                return this.safeValue(value);
            default:
                return '(' + expr + ')';
        }
    }

    /** Safely escape this table name, column name, or other SQL identifier */
    safeName<T>(text: DbTableName<T>): string {
        text = (text as DbTable<T>).table ?? text;
        if ((text as string).indexOf('"') > -1) throw new Error('Invalid DB identifier');
        if (text.match(/^[a-z]([a-z0-9_])*(\.[a-z][a-z0-9_]*)?$/i)) return text;
        return '"' + (text as string).trim().replace(/\./g, '"."') + '"';
    }

    /** Safely escape a string value for use in an SQL statement */
    safeValue(value: string | boolean | number | Date | null | undefined): string {
        if (value === null || value === undefined) return 'NULL';
        if (value === true || value === false) return value.toString();
        if ((value as number).toExponential) return value.toString();
        if ((value as Date).getUTCMilliseconds) value = (value as Date).toISOString();
        value = (value + '').replace(/'/g, `''`);
        return `'` + value + `'`;
    }

    gutsOfLike(value: string | undefined) {
        if (!value) return '';
        return (value + '')
            .replace(/\\/g, '\\\\')
            .replace(/%/g, '\\%')
            .replace(/'/g, `''`);
    }

    /** Construct a LIKE statement for case-insensitive keyword matching */
    exprContains(expr: string, value: string): string {
        value = this.gutsOfLike(value)!;
        return `LOWER(${expr}) LIKE '%${value}%'`;
    }

    /** Construct a LIKE statement for case-insensitive begins-with matching */
    exprBeginsWith(expr: string, value: string): string {
        value = this.gutsOfLike(value)!;
        return `LOWER(${expr}) LIKE '${value}%'`;
    }

    /** Construct a LIKE statement for case-insensitive ends-with matching */
    exprEndsWith(expr: string, value: string): string {
        value = this.gutsOfLike(value)!;
        return `LOWER(${expr}) LIKE '%${value}'`;
    }

    /** Construct a LIKE statement for case-insensitive text match */
    exprEquals(expr: string, value: string): string {
        value = this.safeValue(value)
            .toLowerCase();
        return `LOWER(${expr}) = ${value}`;
    }

    /** Construct a WHERE clause for a Google-like keyword search across potentially multiple fields */
    textSearchFilter(filterText: string | undefined, columns: string[]) {
        if (!filterText) return 'AND 1=1';

        // Parse the terms
        let terms: string[] = [];
        let match;
        while (match = this.textSearchKeywordRegex.exec(filterText)) {
            const term = match[1] ?? match[3];
            terms.push(`'%${dbCore.gutsOfLike(term.toLowerCase())}%'`);
        }

        // Construct and return the SQL
        const sql = terms
            .map(term => 'AND (\n  ' + columns
                .map(col => {
                    return `LOWER(${this.safeName(col)}) LIKE ${term}`;
                })
                .join(' OR ') + '\n)')
            .join('\n');
        return sql;
    }

    textSearchKeywordRegex = /"([^"]+)("|\s*$)|([^ \t\r\n]+)/g;

}

export const dbCore = new Db('CORE');
