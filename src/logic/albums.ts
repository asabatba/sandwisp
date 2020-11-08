

import { Err, Ok, Result } from '@hqoss/monads';
import { albumTrackIdsInDatabase, insertAlbumTracks, loadAudioAnalysisSectionsOfAlbum } from '../db/albums';
import { getColorsOf } from '../db/colors';
import { SpotifyClient } from '../spotify/client';
import { retrieveAndSaveColors } from './colors';
import { retrieveAndSaveAllTracksToDatabase } from './tracks';

// export function loadAlbum(aid: string) {

//     const spoti = new SpotifyClient();
//     const connection = spoti.connect();
//     // if (connection.isErr()) {

//     //     return Err('Error while connecting to spotify, ' + connection.unwrapErr().message);
//     // }
//     fork((err) => {

//     })(console.log)(connection);

//     both(spoti.getAlbumTracks(aid))(albumTrackIdsInDatabase(aid))

//     // const albumTracksRes = (await spoti.getAlbumTracks(aid));
//     // const existingTracks = await albumTrackIdsInDatabase(aid);

//     // if (albumTracksRes.isErr()) {

//     //     return Err(albumTracksRes.unwrapErr().message);
//     // }

//     // const albumTracks = albumTracksRes.unwrap();

//     // const albumTrackIds = albumTracks.map(t => t.id);
//     // const databaseHit = albumTrackIds.every((id) => existingTracks.includes(id));

//     // if (databaseHit) {

//     //     return Ok(null);
//     // } else {

//     //     await insertAlbumTracks(aid, albumTracks);
//     //     await retrieveAndSaveAllTracksToDatabase(albumTrackIds);
//     // }

//     // return Ok(null);
// }

export async function loadAlbum(aid: string): Promise<Result<void, string>> {

    const spoti = new SpotifyClient();
    const connection = await spoti.connect();
    if (connection.isErr()) {

        return Err('Error while connecting to spotify, ' + connection.unwrapErr().message);
    }

    const albumTracksRes = (await spoti.getAlbumTracks(aid));
    const existingTracks = await albumTrackIdsInDatabase(aid);

    if (albumTracksRes.isErr()) {

        return Err(albumTracksRes.unwrapErr().message);
    }

    const albumTracks = albumTracksRes.unwrap();

    const albumTrackIds = albumTracks.map(t => t.id);
    const databaseHit = albumTrackIds.every((id) => existingTracks.includes(id));

    if (databaseHit) {

        return Ok(null);
    } else {

        await insertAlbumTracks(aid, albumTracks);
        await retrieveAndSaveAllTracksToDatabase(albumTrackIds);
    }

    // console.log(albumTrackIds.join('; '));
    // const tracksToRetrieve = albumTrackIds;
    return Ok(null);
}

export const loadAlbumSections = (aid: string) => loadAudioAnalysisSectionsOfAlbum(aid);

export const getAlbumData = async (aid: string): Promise<Result<void, string>> => {
    const spoti = new SpotifyClient();
    await spoti.connect();
    const albumRes = await spoti.getAlbum(aid);

    if (albumRes.isErr()) {

        return albumRes.mapErr(e => e.message);
    }
    const album = albumRes.unwrap();

    let albumColors = await getColorsOf('album', aid);

    if (!albumColors) {

        const smallestImgUrl = album.images.reduce((acc: { height: number; }, img: { height: number; }) => img.height < acc.height ? img : acc, { height: Infinity }).url;
        console.log(smallestImgUrl);
        albumColors = await retrieveAndSaveColors('album', aid, smallestImgUrl);
    }

    return Ok({ ...album, colors: albumColors });
};
