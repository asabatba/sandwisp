

import { Pool } from 'pg';

const pool = new Pool();

// export const query =
//     async (text: string, values?: any, callback?: (err: Error, result: QueryResult<any>) => void) => {
//         return pool.query(text, values, callback);
//     };

// export const query = pool.query;

export default pool;