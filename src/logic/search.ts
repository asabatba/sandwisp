
import { SpotifyClient } from '../spotify/client';



export async function searchAlbum(query: string) {

    const spoti = new SpotifyClient();
    await spoti.connect();
    return spoti.searchAlbum(query);
}
