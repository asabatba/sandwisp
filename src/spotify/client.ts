
import axios from 'axios';
import _ from 'lodash';
import config from '../config';

export class SpotifyClient {

    accountsUrl = 'https://accounts.spotify.com';
    apiUrl = 'https://api.spotify.com';
    userToken = 'userTokenHere';
    clientId = config.SPOTIFY_CLIENT_ID;
    clientKey = config.SPOTIFY_CLIENT_KEY;
    accessToken: string;

    constructor() {
    }

    async connect() {
        const response = await axios.post(`${this.accountsUrl}/api/token`,
            'grant_type=client_credentials'
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${this.clientKey}`
                }
            });
        this.accessToken = response.data.access_token;
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
        const chunks = _.chunk(idList, 50);
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
        const chunks = _.chunk(idList, 50);
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

    async getPlaylistTracks(playlistId: string) {
        const allItems = [];
        let response = await axios.get(`${this.apiUrl}/v1/playlists/${playlistId}/tracks`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` },
        });
        allItems.push(...response.data.items);

        while (response.data.next) {
            response = await axios.get(response.data.next, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            allItems.push(...response.data.items);
        }
        return allItems.filter(t => t.track.type === 'track');
    }

    async getAlbumTracks(albumId: string) {
        const allItems = [];
        let response = await axios.get(`${this.apiUrl}/v1/albums/${albumId}/tracks`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` },
        });
        allItems.push(...response.data.items);

        while (response.data.next) {
            response = await axios.get(response.data.next, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            allItems.push(...response.data.items);
        }
        return allItems.filter(t => t.type === 'track');
    }

    async search(q: string, types: SpotifyObjectType[], limit: number) {

        let response = await axios.get(`${this.apiUrl}/v1/search`,
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
