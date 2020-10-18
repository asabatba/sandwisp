
import pool from './index';

export async function getColorsOf(type: 'album' | 'playlist', id: string) {

    const results = await pool.query(`
    select colors
    from sandwisp.colors
    where type = $1 AND id = $2
    `, [type, id]);

    // undefined if no matches
    return results.rows[0]?.colors;
}

export async function setColorsOf(type: string, id: string, colors: number[][]) {

    const results = await pool.query(`
    insert into sandwisp.colors
    (type, id, colors)
    values ($1,$2,$3)
    `, [type, id, JSON.stringify(colors)]);

    return results.rowCount;
}

