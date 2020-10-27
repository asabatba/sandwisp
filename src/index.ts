
// import { Client } from 'pg';


// const client = new Client();

// async function checkExistingAudioFeatures() {

//     await client.connect();
//     const qRes = await client.query('select id from sandwisp.audio_features where data is not null;');
//     const rows = qRes.rows;
//     const existingIds = (await client.query('select id from sandwisp.track_info where data is not null;')).rows.map(o => o.id);
//     const groups = chunk(rows.map(r => r.id), 50);
//     const spoti = new SpotifyClient();
//     await spoti.connect();
//     for (const ids of groups) {
//         console.log(ids);
//         const tracksInfo = await spoti.getTracks(ids);
//         for (const track of tracksInfo.tracks) {
//             if (existingIds.includes(track.id))
//                 continue;
//             // console.log(`insert into sandwisp.track_info (id,data) values ('${track.id}','${JSON.stringify(track)}')`);
//             const q = `insert into sandwisp.track_info (id,data) values ('${track.id}','${insertJsonFormat(track)}')`;
//             try {
//                 const qr = await client.query(q);
//             } catch (err) {
//                 console.error(q);
//             }
//         }
//         // spoti.getTracks(ids);
//     }
//     await client.end();
// }


// async function authflow() {

//     // https://arsaba.dev/#access_token=BQBCmWFER_kRQKbyVFSKokQalDcwu8ma_DqThK0cYymHelp8iu_iBODWmDjojaVd4qdx0YrbgvR-iMwBRxnvJ3I544V1cc7Y7Dz2HbI8QwhSbLS-Fk08eSGjg7OcvLus8swrLbZwqKFyDcJxT1rWFiDD&token_type=Bearer&expires_in=3600
//     await client.connect();
//     const spoti = new SpotifyClient();
//     await spoti.connect();
//     const tracks = await spoti.getUserTracks();
//     // console.log(`Tracks: ${tracks.map(i => i.track.name).join(', ')}`);
//     // untested
//     const splitter = chunk(tracks.map(t => t.track.id), 100);
//     for (const trackIds of splitter) {
//         const res = await spoti.getAudioFeatures(trackIds);
//         for (const features of res.audio_features) {
//             await client.query(`insert into sandwisp.audio_features (id,data) values ('${features.id}','${insertJsonFormat(features)}')`);
//         }
//     }

//     await client.end();
// }


// function* chunk(allItems, maxItemsPerYield) {
//     const groups = Math.ceil(allItems.length / maxItemsPerYield);
//     for (let i = 0; i < groups; i++) {
//         yield allItems.slice(i * maxItemsPerYield, (i + 1) * maxItemsPerYield);
//     }
// }

