
import { SpotifyClient } from '../spotify/client';



export async function searchAlbum(query: string) {

    const spoti = new SpotifyClient();
    await spoti.connect();
    return spoti.searchAlbum(query);
}

export async function searchPlaylist(query: string) {

    const spoti = new SpotifyClient();
    await spoti.connect();
    return spoti.searchPlaylist(query);
}
