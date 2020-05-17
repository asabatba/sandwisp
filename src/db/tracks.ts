
import pool from './index';


/**
 * Checks if track is (fully) loaded into the DB.
 * 
 * Fully loaded means track_info, audio_features and audio_analysis tables.
 * @param trackId 
 */
export async function checkIfTrackInDatabase(trackId: string) {

    const r = await pool.query(`select ti.id
    from track_info ti
    join audio_features af on ti.id = af.id
    join audio_analysis aa on ti.id = aa.id
    where ti.id = $1`, [trackId]);
    return r.rowCount > 0;
}

export async function insertTrackInfo(trackId: string, data: any) {

    await pool.query('insert into sandwisp.track_info (id,data) values ($1,$2) on conflict do nothing', [trackId, JSON.stringify(data)]);
}

export async function insertTrackAudioFeatures(trackId: string, data: any) {

    await pool.query('insert into sandwisp.audio_features (id,data) values ($1,$2) on conflict do nothing', [trackId, JSON.stringify(data)]);
}

export async function insertTrackAudioAnalysis(trackId: string, data: any) {

    await pool.query('insert into sandwisp.audio_analysis (id,meta,track,bars,beats,sections,segments,tatums) values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict do nothing',
        [trackId, JSON.stringify(data.meta), JSON.stringify(data.track),
            JSON.stringify(data.bars), JSON.stringify(data.beats),
            JSON.stringify(data.sections), JSON.stringify(data.segments),
            JSON.stringify(data.tatums)]);
}

