
import axios from "axios";
import { config } from "dotenv";
import { Client } from "pg";
config();


const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});

class QueryHelper {

    static addTrackInfo(id: string, data) {
        return `insert into sandwisp.track_info (id,data) values ('${id}','${insertJsonFormat(data)}')`;
    }

    static addTrackAudioFeatures(id: string, data) {
        return `insert into sandwisp.audio_features (id,data) values ('${id}','${insertJsonFormat(data)}')`;
    }

    static addAudioAnalysis(id: string, data) {
        return `insert into sandwisp.audio_analysis (id,meta,track,bars,beats,sections,segments,tatums) values ('${id}','${insertJsonFormat(data.meta)}','${insertJsonFormat(data.track)}','${insertJsonFormat(data.bars)}','${insertJsonFormat(data.beats)}','${insertJsonFormat(data.sections)}','${insertJsonFormat(data.segments)}','${insertJsonFormat(data.tatums)}')`;
    }

    static tracksInDatabase() {
        return `select id from sandwisp.track_info`;
    }
}


async function checkExistingAudioFeatures() {

    await client.connect();
    const qRes = await client.query('select id from sandwisp.audio_features where data is not null;');
    const rows = qRes.rows;
    const existingIds = (await client.query('select id from sandwisp.track_info where data is not null;')).rows.map(o => o.id);
    const groups = arraySplitter(rows.map(r => r.id), 50);
    const spoti = new SpotifyClient();
    await spoti.connect();
    for (const ids of groups) {
        console.log(ids);
        const tracksInfo = await spoti.getTracks(ids);
        for (const track of tracksInfo.tracks) {
            if (existingIds.includes(track.id))
                continue;
            // console.log(`insert into sandwisp.track_info (id,data) values ('${track.id}','${JSON.stringify(track)}')`);
            const q = `insert into sandwisp.track_info (id,data) values ('${track.id}','${insertJsonFormat(track)}')`;
            try {
                const qr = await client.query(q);
            } catch (err) {
                console.error(q);
            }
        }
        // spoti.getTracks(ids);
    }
    await client.end();
}

// checkExistingAudioFeatures();

const insertJsonFormat = (obj) => JSON.stringify(obj).replace(/'/g, "''");

async function test() {

    await client.connect();
    const spoti = new SpotifyClient();
    await spoti.connect();
    // const trackId = '06AKEBrKUckW0KREUWRnvT';
    const ids = ['4zRiMMsvPOMl1Wajzp9h6u', '0b4sQdKW7hB91GanVhNYrq', '6adlXwVksCaIp8srSJ96Iy', '0jgOPKAwVW3gpbNk94rFIq', '2RGklGgq8yLJdCHdrD4u05', '6njubzRnCZMLgluHijShxT', '2ItUazCFbA7QnAYbmAysls', '2cXHGk1xgwKBghFTBTYQJ5', '2Bh5yaioEoQ23XD8KVUlkN', '3d5y51BomOkO2JP6eQbCAO', '6Z2bDjmI0GWcOS5LFsH8Gr', '5JQkJfSaIFA9U5lnRwUxAt'];
    for (const trackId of ids) {
        try {
            const analysis = await spoti.getTrackAnalysis(trackId);
            const qr = await client.query(`insert into sandwisp.test (id,data) values ('${trackId}','${insertJsonFormat(analysis)}')`);
            console.log(qr);
        } catch (err) {
            console.error('Something failed', err);
        }
    }
    await client.end();
}

async function afeatures() {
    // audio_features
    await client.connect();
    const spoti = new SpotifyClient();
    await spoti.connect();
    const ids = ["2eKrn8PG4Qak6yoItRC4sL", "66SPXY48GHqvedbRT7jBey", "01TyFEZu6mHbffsVfxgrFn", "0NyE3z63bQpiqDkx6DSjl0", "0A8P76W8MXeulFGIHNWSG1", "716OZGLBg3vkNfMTpfbYm6", "67iCfFQL1SWgjPKo24SlCr", "7zJe81f6l3pHwpUGSQj3HY", "392fECmnYZTQjL97hqEElg", "4z17lasP9rNazlyeegw5J6", "5cY6iwmzNfroYMCuLOlJio", "0HIk8Bo0yu6bwaDQxk5wWp", "55pG7x7OMhuokLDyqmgFBw", "2TiTcWEs1CldfTx7fOGfS4", "4ts3OSGKwYLwheyZme9mbh", "6o2ZPDOBPJypL5wa7hgqlC", "1RI9Qpt8QbYtwfCW8npcO1", "1r6jgeo9QiOVdqhWG8XPy5", "1XiPbxVSCgMLO0QsUPazBt", "4T7okh1A7MmqS7xXypO0wx", "1EQuf1dflSSt3HfUNIOzDM", "27MNsCvgxqdBE2CICEXkrY", "7zRw1eddw1Jb2HMS7dZ28b", "6Cb6cDEIKJQHUWD2xYLx00", "7pHz9U4AZVAQXjs6ik0duH", "0FX1q46YjBPYd6PQlBRcwj", "14Ogmyyyb77rupsRw318ay", "2JQ9wMmURQMY5ysth04rHO", "13YxuRQZdU7snOfDI3nft2", "3MVL733KX2m9G76qPnTttk", "3Jirvz8n8qv015ewSt3VKg", "3A4JYHXVpMWAsGqFWcZ8WO", "1vTrE6ltaxo9X2iYYFhovs", "3hrr00VycUcp9S0R2ojBFq", "4m32ZYmSYgGziMwx3cJxS7"];

    const res = await spoti.getAudioFeatures(ids);

    console.log(`Gonna retrieve ${ids.length} features.`);
    for (const features of res.audio_features) {
        try {
            const qr = await client.query(`insert into sandwisp.audio_features (id,data) values ('${features.id}','${insertJsonFormat(features)}')`);
            // console.log(qr.rows);
        } catch (err) {
            console.error('Something failed', err);
        }
    }

    await client.end();
}

async function authflow() {

    // https://arsaba.dev/#access_token=BQBCmWFER_kRQKbyVFSKokQalDcwu8ma_DqThK0cYymHelp8iu_iBODWmDjojaVd4qdx0YrbgvR-iMwBRxnvJ3I544V1cc7Y7Dz2HbI8QwhSbLS-Fk08eSGjg7OcvLus8swrLbZwqKFyDcJxT1rWFiDD&token_type=Bearer&expires_in=3600
    await client.connect();
    const spoti = new SpotifyClient();
    await spoti.connect();
    const tracks = await spoti.getUserTracks();
    // console.log(`Tracks: ${tracks.map(i => i.track.name).join(', ')}`);
    // untested
    const splitter = arraySplitter(tracks.map(t => t.track.id), 100);
    for (const trackIds of splitter) {
        const res = await spoti.getAudioFeatures(trackIds);
        for (const features of res.audio_features) {
            await client.query(`insert into sandwisp.audio_features (id,data) values ('${features.id}','${insertJsonFormat(features)}')`);
        }
    }

    await client.end();
}

function* arraySplitter(allItems, maxItemsPerYield) {
    const groups = Math.ceil(allItems.length / maxItemsPerYield);
    for (let i = 0; i < groups; i++) {
        yield allItems.slice(i * maxItemsPerYield, (i + 1) * maxItemsPerYield);
    }
}

// test();


export class SpotifyClient {

    accountsUrl = 'https://accounts.spotify.com';
    apiUrl = 'https://api.spotify.com';
    clientId = process.env.SPOTIFY_CLIENT_ID;
    userToken = 'userTokenHere';
    appAuth = process.env.SPOTIFY_CLIENT_CREDS;
    accessToken: string;

    constructor() {

    }

    async connect() {
        const response = await axios.post(`${this.accountsUrl}/api/token`,
            `grant_type=client_credentials`
            , {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${this.appAuth}`
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
            query: { limit: 50 }
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
}

type SpotifyObjectType = 'album' | 'artist' | 'playlist' | 'track' | 'show' | 'episode';

// authflow();

async function loadTrackData(pgClient: Client, spotifyClient: SpotifyClient, tracksToRetrieve: string[]) {
    for (const group of arraySplitter(tracksToRetrieve, 50)) {

        let tracks;
        try {
            tracks = (await spotifyClient.getTracks(group)).tracks;
        } catch (err) {
            throw new Error('Error fetching tracks.');
        }

        const aufes = (await spotifyClient.getAudioFeatures(group)).audio_features;
        for (const tr of tracks) {
            try {
                await pgClient.query(QueryHelper.addTrackInfo(tr.id, tr));
            } catch (err) {
                console.error(err);
            }
            try {
                await pgClient.query(QueryHelper.addTrackAudioFeatures(tr.id, aufes.find(t => t.id === tr.id)));
            } catch (err) {
                console.error(err);
            }
            try {
                const analysis = await spotifyClient.getTrackAnalysis(tr.id);
                await pgClient.query(QueryHelper.addAudioAnalysis(tr.id, analysis));
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function albumTracksInDatabase(pgClient: Client, aid: string): Promise<string[]> {

    const results = (await pgClient.query(`
 select track_id from album_tracks at2 where id = '${aid}';
    `)).rows;
    return results.map(r => r.track_id);
}

export async function searchAlbum(query: string) {
    const spoti = new SpotifyClient();
    await spoti.connect();
    return spoti.searchAlbum(query);
}

export async function loadAlbum(pgClient: Client, aid: string) {
    // await client.connect();

    const spoti = new SpotifyClient();
    await spoti.connect();
    let albumTracks;
    try {
        albumTracks = (await spoti.getAlbumTracks(aid));
    } catch (err) {
        console.error(err);
        throw new Error(`Error fetching album tracks ${err}`);
    }
    const existingTracks = await albumTracksInDatabase(pgClient, aid);

    const albumTrackIds = albumTracks.map(t => t.id);
    const databaseHit = albumTrackIds.every((id) => existingTracks.includes(id));

    if (databaseHit) {
        console.log(`database hit for album ${aid}`);
        return;
    }

    console.log(albumTrackIds.join('; '));

    const tracksToRetrieve = albumTrackIds; // = playlistTrackIds.filter(id => 
    const tidsInsert = albumTracks.map(t => `('${aid}','${t.id}','${t.disc_number}','${t.track_number}')`).join(',');

    pgClient.query(`insert into sandwisp.album_tracks (id, track_id, disc_number, track_number) values${tidsInsert}`)


    await loadTrackData(pgClient, spoti, tracksToRetrieve,);

    // await client.end();
}

async function loadPlaylist(pid: string) {
    await client.connect();

    const spoti = new SpotifyClient();
    await spoti.connect();
    console.log('connected');
    // const playlistData = await spoti.getPlaylist(pid);
    const playlistTrackIds = (await spoti.getPlaylistTracks(pid)).map(t => t.track.id);

    console.log(playlistTrackIds.join('; '));

    // const existingTracks = (await client.query(QueryHelper.tracksInDatabase())).rows;

    const tracksToRetrieve = playlistTrackIds; // = playlistTrackIds.filter(id => !existingTracks.includes(id));

    for (const group of arraySplitter(tracksToRetrieve, 50)) {
        const tracks = (await spoti.getTracks(group)).tracks;
        const aufes = (await spoti.getAudioFeatures(group)).audio_features;
        for (const tr of tracks) {
            try {
                await client.query(`insert into sandwisp.playlist_tracks (id, track_id) values('${pid}', '${tr.id}')`);
            } catch (err) {
                console.error(err);
            }
            try {
                await client.query(QueryHelper.addTrackInfo(tr.id, tr));
            } catch (err) {
                console.error(err);
            }
            try {
                await client.query(QueryHelper.addTrackAudioFeatures(tr.id, aufes.find(t => t.id === tr.id)));
            } catch (err) {
                console.error(err);
            }
        }
    }

    await client.end();
}

// loadPlaylist('5zu4uCPubzrjkyufipfGVV').then(() => { });

async function analyseTracks() {
    await client.connect();
    const spoti = new SpotifyClient();
    await spoti.connect();

    const ids = (await client.query(QueryHelper.tracksInDatabase())).rows.map(r => r.id);

    for (const tid of ids) {

        try {
            const analysis = await spoti.getTrackAnalysis(tid);
            await client.query(QueryHelper.addAudioAnalysis(tid, analysis));
        } catch (err) {
            console.error(err);
        }

    }

    await client.end();
}

// analyseTracks();
// loadAlbum('7mQSfTIli4awcQj1w1Fbou');
