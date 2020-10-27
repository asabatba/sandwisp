
import Knex from 'knex';
import { DB_CLIENT, DB_DATABASE, DB_PASSWORD, DB_USER } from '../config';

export default Knex({
    client: DB_CLIENT,
    connection: {
        database: DB_DATABASE,
        user: DB_USER,
        password: DB_PASSWORD,
    },
    pool: {
        min: 2,
        max: 10
    },
});
