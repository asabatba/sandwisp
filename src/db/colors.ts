
import knex from './index';

export async function getColorsOf(type: 'album' | 'playlist', id: string) {

    const results = await knex('colors')
        .where({ type, id })
        .select('colors');

    return results[0]?.colors;
}

export async function setColorsOf(type: string, id: string, colors: number[][]) {

    const results = await knex('colors')
        .insert({ type, id, colors: JSON.stringify(colors) });

    return results.length;
}
