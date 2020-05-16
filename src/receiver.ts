
import { AxiosRequestConfig } from 'axios';
import cors from 'cors';
import express from 'express';
import slowDown from 'express-slow-down';
import { readFileSync } from 'fs';
import https from 'https';
import { Client } from 'pg';
import { loadAlbum, searchAlbum } from './index';

const app = express();
const port = 4000;


const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 100, // allow 100 requests per 15 minutes, then...
    delayMs: 500 // begin adding 500ms of delay per request above 100:
});

//  apply to all requests
app.use(speedLimiter);

app.use(cors());

const pgClient = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});

app.get('/albums/:aid/sections', getAlbumSections);
app.get('/search/albums/:q', searchAlbums);

async function getAlbumSections(req: AxiosRequestConfig, res) {

    const aid = req.params['aid'];

    if (!aid) {
        return res.status(400).send({ error: 'Missing/null albumId' });
    }

    try {
        await loadAlbum(pgClient, aid.replace(/[\W]+/g, ''));
    } catch (err) {
        // console.error(err.message);
        return res.status(500).send({ error: err.message });
    }

    const q = await pgClient.query(`
	select
	aa.id,
	atracks.disc_number,
	atracks.track_number,
	track_name,
	((jsonb_array_elements(sections))->'start')::float as "start",
	((jsonb_array_elements(sections))->'duration')::float as "duration",
	((jsonb_array_elements(sections))->'loudness')::float as "loudness",
	((jsonb_array_elements(sections))->'key')::int as "key",
	((jsonb_array_elements(sections))->'mode')::int as "mode",
	((jsonb_array_elements(sections))->'tempo')::float as "tempo"
from
	audio_analysis aa
join (
	select
		at2.id,
		track_id,
		ti.data->>'name' as track_name,
		disc_number,
		track_number
	from
		album_tracks at2
	join track_info ti on
		at2.track_id = ti.id
	where
		at2.id = '${aid}'
	order by
		disc_number asc,
		track_number asc) "atracks" on
	aa.id = atracks.track_id ;
    `);
    for (const row of q.rows) {
        for (const k in row) {
            row[k] = row[k] === null ? 0 : row[k];
        }
    }

    res.status(200).send(q.rows);
}

async function searchAlbums(req, res) {

    const query = req.params['q'];

    if (!query) {
        return res.status(400).send({ error: 'Missing/null search query' });
    }

    let results;
    try {
        results = await searchAlbum(query);
    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
    return res.status(200).send(results);
}

pgClient.connect().then(() => {
    // app.listen(port, () => console.log(`Listening on ${port}`));
    let key, cert;
    try {
        key = readFileSync(process.env.SERVER_KEY, 'utf8');
        cert = readFileSync(process.env.SERVER_CERT, 'utf8');
    } catch (err) {
        console.error(err);
        return;
    }

    const httpsServer = https.createServer({
        key: key,
        cert: cert

    }, app);
    httpsServer.listen(port);
});

