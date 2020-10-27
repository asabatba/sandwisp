
import knex from './index';


/**
 * Checks if track is (fully) loaded into the DB.
 * 
 * Fully loaded means track_info, audio_features and audio_analysis tables.
 * @param trackId 
 */
export async function checkIfTrackInDatabase(trackId: string): Promise<boolean> {

    const rs = await knex('track_info')
        .join('audio_features', 'track_info.id', '=', 'audio_features.id')
        .join('audio_analysis', 'track_info.id', '=', 'audio_analysis.id')
        .where('track_info.id', trackId)
        .select('track_info.id');
    return rs.length > 0;
}

export async function insertTrackInfo(trackId: string, data: any) {

    await knex.raw(`
        insert into sandwisp.track_info (id, data) values (?,?)
        on conflict (id) do update set data = excluded.data
    `, [trackId, JSON.stringify(data)]);
}

export async function insertTrackAudioFeatures(trackId: string, data: any) {

    await knex.raw(`
        insert into sandwisp.audio_features (id,data) values (?,?) 
        on conflict (id) do update set data = excluded.data`,
        [trackId, JSON.stringify(data)]);
}

export async function insertTrackAudioAnalysis(trackId: string, data: any) {

    await knex.raw(`
    insert into sandwisp.audio_analysis (id,meta,track,bars,beats,sections,segments,tatums)
    values (?,?,?,?,?,?,?,?) on conflict do nothing`,
        [
            trackId, JSON.stringify(data.meta),
            JSON.stringify(data.track), JSON.stringify(data.bars),
            JSON.stringify(data.beats), JSON.stringify(data.sections),
            JSON.stringify(data.segments), JSON.stringify(data.tatums),
        ]);
}

