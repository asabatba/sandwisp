
import Knex from 'knex';
import { knexConfig } from '../config';
// import { DB_CLIENT, DB_DATABASE, DB_PASSWORD, DB_USER } from '../config';

export default Knex(knexConfig);

