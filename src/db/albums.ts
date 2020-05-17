
import pool from './index';


export async function albumTrackIdsInDatabase(albumId: string) {

    if (!albumId) throw new Error('albumId is null?');
    const results = (await pool.query('select track_id from album_tracks where id = $1',
        [albumId])).rows;
    return results.map(r => r.track_id);
}

export async function insertAlbumTracks(albumId: string, albumTracks: { id: string, disc_number: number, track_number: number }[]) {

    const promises = albumTracks.map((track) => {
        return pool.query('insert into sandwisp.album_tracks (id, track_id, disc_number, track_number) values ($1,$2,$3,$4)',
            [albumId, track.id, track.disc_number, track.track_number]);
    });

    await Promise.all(promises);
}


export async function loadAudioAnalysisSectionsOfAlbum(albumId: string) {

    const q = await pool.query(`
	select
	aa.id,
	atracks.disc_number,
	atracks.track_number,
	track_name,
	((jsonb_array_elements(sections))->'start')::float as "start",
	((jsonb_array_elements(sections))->'duration')::float as "duration",
	((jsonb_array_elements(sections))->'loudness')::float as "loudness",
	((jsonb_array_elements(sections))->'key')::int as "key",
	((jsonb_array_elements(sections))->'mode')::int as "mode",
	((jsonb_array_elements(sections))->'tempo')::float as "tempo"
from
	audio_analysis aa
join (
	select
		at2.id,
		track_id,
		ti.data->>'name' as track_name,
		disc_number,
		track_number
	from
		album_tracks at2
	join track_info ti on
		at2.track_id = ti.id
	where
		at2.id = $1
	order by
		disc_number asc,
		track_number asc) "atracks" on
	aa.id = atracks.track_id ;
    `, [albumId]);

    /**
     * Spotify seems to -now- send nulls instead of zeroes.
     * It's up to us to revert it.
     */
    for (const row of q.rows) {
        for (const k in row) {
            row[k] = row[k] === null ? 0 : row[k];
        }
    }
    return q.rows;
}

