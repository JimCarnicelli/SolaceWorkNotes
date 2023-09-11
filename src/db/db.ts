import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_CORE_HOST,
    port: +process.env.DB_CORE_PORT!,
    username: process.env.DB_CORE_USER,
    password: process.env.DB_CORE_PASSWORD,
    database: process.env.DB_CORE_DATABASE,
    entities: [User],
    synchronize: true,
    logging: false,
})

// to initialize the initial connection with the database, register all entities
// and 'synchronize' database schema, call 'initialize()' method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error));
