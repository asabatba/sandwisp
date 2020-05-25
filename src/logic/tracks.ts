

import { insertTrackAudioAnalysis, insertTrackAudioFeatures, insertTrackInfo } from '../db/tracks';
import { SpotifyClient } from '../spotify/client';


export async function retrieveAndSaveAllTracksToDatabase(trackIds: string[]) {

    const spoti = new SpotifyClient();
    await spoti.connect();

    const allTracks = await spoti.getAllTracks(trackIds);
    const allAudioFeatures = await spoti.getAllAudioFeatures(trackIds);

    // add things to db
    for (let i = 0; i < allTracks.length; i++) {
        console.log(i+'/'+allTracks.length);
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