

// loadPlaylist, loadPlaylistSections

import { insertPlaylistTracks, loadAudioAnalysisSectionsOfPlaylist, playlistTrackIdsInDatabase } from '../db/playlists';
import { SpotifyClient } from '../spotify/client';
import { retrieveAndSaveAllTracksToDatabase } from './tracks';


export async function loadPlaylist(pid: string) {

    const spoti = new SpotifyClient();
    await spoti.connect();
    let playlistTracks;
    try {
        playlistTracks = (await spoti.getPlaylistTracks(pid, 'next,items(added_at,track(id,type))'));
    } catch (err) {
        console.error(err);
        throw new Error(`Error fetching playlist tracks ${err}`);
    }
    const existingTracks = await playlistTrackIdsInDatabase(pid);

    const playlistTrackIds = playlistTracks.map(t => t.track.id);
    const databaseHit = playlistTrackIds.every((id) => existingTracks.includes(id));

    if (databaseHit) {
        console.log(`database hit for playlist ${pid}`);
        return;
    }

    console.log(playlistTrackIds.join('; '));

    try {
        await insertPlaylistTracks(pid, playlistTracks);
        await retrieveAndSaveAllTracksToDatabase(playlistTrackIds);
    } catch (err) {
        console.error('Error on loadPlaylist logic.', err);
    }
}

export const loadPlaylistSections = (aid: string) => loadAudioAnalysisSectionsOfPlaylist(aid);


