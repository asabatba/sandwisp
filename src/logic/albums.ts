

import { albumTrackIdsInDatabase, insertAlbumTracks, loadAudioAnalysisSectionsOfAlbum } from '../db/albums';
import { SpotifyClient } from '../spotify/client';
import { retrieveAndSaveAllTracksToDatabase } from './tracks';


export async function loadAlbum(aid: string) {

    const spoti = new SpotifyClient();
    await spoti.connect();
    let albumTracks;
    try {
        albumTracks = (await spoti.getAlbumTracks(aid));
    } catch (err) {
        console.error(err);
        throw new Error(`Error fetching album tracks ${err}`);
    }
    const existingTracks = await albumTrackIdsInDatabase(aid);

    const albumTrackIds = albumTracks.map(t => t.id);
    const databaseHit = albumTrackIds.every((id) => existingTracks.includes(id));

    if (databaseHit) {
        console.log(`database hit for album ${aid}`);
        return;
    }

    console.log(albumTrackIds.join('; '));

    // const tracksToRetrieve = albumTrackIds;

    await insertAlbumTracks(aid, albumTracks);

    await retrieveAndSaveAllTracksToDatabase(albumTrackIds);
}

export const loadAlbumSections = (aid: string) => loadAudioAnalysisSectionsOfAlbum(aid);

export const getAlbumData = async (aid: string) => {
    const spoti = new SpotifyClient();
    await spoti.connect();
    const album = await spoti.getAlbum(aid);
    return album;
};
