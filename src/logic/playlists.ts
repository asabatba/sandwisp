

// loadPlaylist, loadPlaylistSections

import { insertPlaylistTracks, loadAudioAnalysisSectionsOfPlaylist, playlistTrackIdsInDatabase } from '../db/playlists';
import { SpotifyClient } from '../spotify/client';
import { retrieveAndSaveAllTracksToDatabase } from './tracks';


export async function loadPlaylist(pid: string) {

    const spoti = new SpotifyClient();
    await spoti.connect();
    let playlistTracks;
    try {
        playlistTracks = (await spoti.getPlaylistTracks(pid,
            'next,items(added_at,track(id,type))'));
        await insertPlaylistTracks(pid, playlistTracks);
    } catch (err) {
        console.error(err);
        throw new Error(`Error fetching playlist tracks ${err}`);
    }
    const existingTracks = await playlistTrackIdsInDatabase(pid);

    console.log(playlistTracks.slice(0, 5), existingTracks.slice(0, 5));

    const playlistTrackIds = playlistTracks.map(t => t.track.id);
    console.warn(playlistTracks.filter(ptr => ptr.track.id == null));
    const databaseHit = playlistTrackIds.every((id) => existingTracks.includes(id));


    if (databaseHit) {
        console.log(`database hit for playlist ${pid}`);
        return;
    }

    try {
        const missingTrackIds = playlistTrackIds.filter(id => !existingTracks.includes(id));
        await retrieveAndSaveAllTracksToDatabase(missingTrackIds);
    } catch (err) {
        console.error('Error on loadPlaylist logic.', err);
    }
}

export const getPlaylistData = async (pid: string) => {

    const spoti = new SpotifyClient();
    await spoti.connect();
    const playlist = await spoti.getPlaylist(pid);
    return playlist;
};

export const loadPlaylistSections = (aid: string) => loadAudioAnalysisSectionsOfPlaylist(aid);


