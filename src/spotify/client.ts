
import { Err, Ok, Result } from '@hqoss/monads';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import R from 'ramda';
import config from '../config';

// const axiosGet = (url: string, config?: AxiosRequestConfig): FutureInstance<AxiosError, AxiosResponse> =>
//     Future((rej, res) => {

//         const source = axios.CancelToken.source();
//         axios.get(url, { ...config, cancelToken: source.token, })
//             .then(res, rej);
//         return source.cancel;
//     });

// const axiosGet = (url: string, config?: AxiosRequestConfig): TaskEither<AxiosError, AxiosResponse> =>
//     tryCatch(
//         () => axios.get(url, config),
//         err => err as AxiosError,
//     );

async function* axiosGetGen(_url: string, config?: AxiosRequestConfig) {

    let response, url = _url;
    do {
        response = await axios.get(url, config);
        yield response.data;
        url = response.data.next;
    } while (url);
}

export class SpotifyClient {

    accountsUrl = 'https://accounts.spotify.com';
    apiUrl = 'https://api.spotify.com';
    userToken = 'userTokenHere';
    clientId = config.SPOTIFY_CLIENT_ID;
    clientKey = config.SPOTIFY_CLIENT_KEY;
    accessToken: string;

    constructor() {
    }

    // connect() {

    //     return Future((rej, res) => {

    //         axios.post(`${this.accountsUrl}/api/token`,
    //             'grant_type=client_credentials'
    //             , {
    //                 headers: {
    //                     'Content-Type': 'application/x-www-form-urlencoded',
    //                     'Authorization': `Basic ${Buffer.from(this.clientId + ':' + this.clientKey).toString('base64')}`,
    //                 }
    //             }).then((response) => {

    //                 this.accessToken = response.data.access_token;
    //                 res(this);
    //             }).catch(err => {
    //                 rej(err);
    //             });

    //         // return Ok(null);
    //         return () => { };
    //     });
    // }

    async connect(): Promise<Result<void, AxiosError>> {

        try {
            const response = await axios.post(`${this.accountsUrl}/api/token`,
                'grant_type=client_credentials'
                , {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${Buffer.from(this.clientId + ':' + this.clientKey).toString('base64')}`,
                    }
                });
            this.accessToken = response.data.access_token;

        } catch (err) {
            return Err(err);
        }
        return Ok(null);
    }

    async authorize() {
        const response = await axios.get(`${this.accountsUrl}/authorize`, {
            params: {
                client_id: this.clientId,
                response_type: 'token',
                redirect_uri: 'https://arsaba.dev/',
                scope: 'playlist-read-private',
            }
        });
    }

    async getTracks(idList: string[]) {
        const response = await axios.get(`${this.apiUrl}/v1/tracks`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` },
            params: { ids: idList.join(',') }
        });
        return response.data;
    }

    // not completed
    async getAllTracks(idList: string[]) {
        const allTracks = [];
        const chunks = R.splitEvery(50, idList);

        for (const chunk of chunks) {
            const response = await this.getTracks(chunk);
            allTracks.push(...response.tracks);
        }
        return allTracks;
    }

    async getTrackAnalysis(id: string) {
        const response = await axios.get(`${this.apiUrl}/v1/audio-analysis/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            }
        );
        // console.log(response.data);
        return response.data;
    }

    // idList max length = 100
    async getAudioFeatures(idList: string[]) {
        if (idList.length > 100) console.warn('idList is too long!');
        const response = await axios.get(`${this.apiUrl}/v1/audio-features`,
            {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                params: {
                    ids: idList.join(','),
                },
            }
        );
        return response.data;
    }

    async getAllAudioFeatures(idList: string[]) {
        const allTracks = [];
        const chunks = R.splitEvery(50, idList);
        for (const chunk of chunks) {
            const response = await this.getAudioFeatures(chunk);
            allTracks.push(...response.audio_features);
        }
        return allTracks;
    }

    // https://api.spotify.com/v1/me/playlists
    async getUserPlaylists() {
        const response = await axios.get(`${this.apiUrl}/v1/me/playlists`, {
            headers: {
                'Authorization': `Bearer ${this.userToken}`
            }
        });
        return response.data;
    }

    async getUserTracks() {
        const allItems = [];
        let response = await axios.get(`${this.apiUrl}/v1/me/tracks`, {
            headers: { 'Authorization': `Bearer ${this.userToken}` },
            params: { limit: 50 }
        });
        allItems.push(...response.data.items);

        while (response.data.next) {
            response = await axios.get(response.data.next, {
                headers: { 'Authorization': `Bearer ${this.userToken}` }
            });
            allItems.push(...response.data.items);
        }
        return allItems;
    }

    async getPlaylist(playlistId: string) {
        const response = await axios.get(`${this.apiUrl}/v1/playlists/${playlistId}`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` },
        });
        return response.data;
    }

    async getPlaylistTracks(playlistId: string, fields?: string) {

        // att: [fields] has to contain 'next' and 'items.track.type' if it exists
        const allItems = [];
        let response = await axios.get(`${this.apiUrl}/v1/playlists/${playlistId}/tracks`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` },
            params: fields ? { fields: fields } : undefined
        });
        allItems.push(...response.data.items);

        while (response.data.next) {
            response = await axios.get(response.data.next, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` },
                params: fields ? { fields: fields } : undefined
            });
            allItems.push(...response.data.items);
        }

        /**
         * Filter non-tracks and local tracks.
         */
        return allItems.filter(t => t.track.type === 'track' && !t.track.is_local);
    }

    async getAlbum(albumId: string): Promise<Result<any, AxiosError>> {

        let response;
        try {
            response = await axios.get(`${this.apiUrl}/v1/albums/${albumId}`, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` },
            });
        } catch (err) {

            return Err(err);
        }
        return Ok(response.data);
    }


    async getAlbumTracks(albumId: string): Promise<Result<any[], AxiosError>> {
        const allItems = [];

        const genFun = axiosGetGen(`${this.apiUrl}/v1/albums/${albumId}/tracks`,
            { headers: { 'Authorization': `Bearer ${this.accessToken}` } });

        for await (const data of genFun) {
            allItems.push(...data.items);
        }

        return Ok(allItems.filter(t => t.type === 'track'));
    }

    async search(q: string, types: SpotifyObjectType[], limit: number) {

        const response = await axios.get(`${this.apiUrl}/v1/search`,
            {
                params: {
                    q: q,
                    type: types.join(','),
                    limit: limit
                },
                headers: { 'Authorization': `Bearer ${this.accessToken}` },
            });

        return response.data;
    }

    async searchAlbum(q: string) {
        const searchResults = await this.search(q, ['album'], 50);
        return searchResults.albums.items;
    }

    async searchPlaylist(q: string) {
        const searchResults = await this.search(q, ['playlist'], 50);
        return searchResults.playlists.items;
    }
}

type SpotifyObjectType = 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode';
