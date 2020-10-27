
import knex from './index';


export async function playlistTrackIdsInDatabase(playlistId: string) {

    if (!playlistId) throw new Error('playlistId is null?');

    const results = await knex('playlist_tracks')
        .join('track_info', 'playlist_tracks.track_id', '=', 'track_info.')
        .where('playlist_tracks.id', '=', 'track_info.id')
        .select('track_info.id');

    return results.map(r => r.id);
}


export async function insertPlaylistTracks(playlistId: string, playlistTracks: { track: { id: string; }, added_at: Date | string; }[]) {

    const promises = playlistTracks.map((ptrack, idx) => {
        return knex.raw(`
        insert into sandwisp.playlist_tracks (id, track_id, track_order, added_at)
        values (?,?,?,?) on conflict (id,track_id)
        do update set track_order = excluded.track_order, added_at = excluded.added_at
        `,
            [playlistId, ptrack.track.id, idx, ptrack.added_at]);
    });

    await Promise.all(promises);
}

export async function loadAudioAnalysisSectionsOfPlaylist(playlistId: string) {

    const q = await knex.raw(`
            select
            aa.id,
            track_name,
            track_order,
            added_at,
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
                pt.id,
                track_id,
                ti.data->>'name' as track_name,
                track_order,
                added_at
            from
                playlist_tracks pt
            join track_info ti on
                pt.track_id = ti.id
            where
                pt.id = ?
            order by
                track_order asc
                ) "atracks" on
            aa.id = atracks.track_id 
    `, [playlistId]);

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

