
import knex from './index';


export async function albumTrackIdsInDatabase(albumId: string) {

	if (!albumId) throw new Error('albumId is null?');
	const results = (await knex
		.select(['track_id'])
		.from('album_tracks')
		.where({ id: albumId }));

	return results.map(r => r.track_id);
}

export async function insertAlbumTracks(albumId: string, albumTracks: { id: string, disc_number: number, track_number: number; }[]) {

	await knex('album_tracks').insert(albumTracks.map(t =>
		({
			id: albumId,
			track_id: t.id,
			disc_number: t.disc_number,
			track_number: t.track_number,
		})));
}


export async function loadAudioAnalysisSectionsOfAlbum(albumId: string) {

	const q = await knex.raw(`
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
			at2.id = ?
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

