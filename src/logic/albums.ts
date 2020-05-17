

import pool from '../db';
import { albumTracksInDatabase, insertAlbumTracks, loadAudioAnalysisSectionsOfAlbum } from '../db/albums';
import { insertTrackAudioAnalysis, insertTrackAudioFeatures, insertTrackInfo } from '../db/tracks';
import { SpotifyClient } from '../spotify/client';



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
    const existingTracks = await albumTracksInDatabase(aid);

    const albumTrackIds = albumTracks.map(t => t.id);
    const databaseHit = albumTrackIds.every((id) => existingTracks.includes(id));

    if (databaseHit) {
        console.log(`database hit for album ${aid}`);
        return;
    }

    console.log(albumTrackIds.join('; '));

    // const tracksToRetrieve = albumTrackIds;

    await insertAlbumTracks(aid, albumTracks);

    // await loadTrackData(pgClient, spoti, tracksToRetrieve);

    const allTracks = await spoti.getAllTracks(albumTrackIds);
    const allAudioFeatures = await spoti.getAllAudioFeatures(albumTrackIds);
    console.log(allTracks);
    // add things to db
    for (let i = 0; i < allTracks.length; i++) {
        const track = allTracks[i];
        const audioFeatures = allAudioFeatures[i];
        const audioAnalysis = await spoti.getTrackAnalysis(track.id);
        try {
            await insertTrackInfo(track.id, track);
        } catch (err) {
            console.error('Error on track_info insert.', err);
        }
        try {
            await insertTrackAudioFeatures(track.id, audioFeatures);
        } catch (err) {
            console.error('Error on audio_features insert.', err);
        }
        try {
            await insertTrackAudioAnalysis(track.id, audioAnalysis);
        } catch (err) {
            console.error('Error on audio_analysis insert.', err);
        }
    }
}

export const loadAlbumSections = (aid: string) => loadAudioAnalysisSectionsOfAlbum(aid);
