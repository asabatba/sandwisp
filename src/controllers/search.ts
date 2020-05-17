
import { NextFunction, Request, Response, Router } from 'express';
import { searchAlbum, searchPlaylist } from '../logic/search';


const searchRouter = Router();

searchRouter.get('/', checkQuery);
searchRouter.get('/albums/:q', searchAlbums);
searchRouter.get('/playlists/:q', searchPlaylists);

async function checkQuery(req: Request, res: Response, next: NextFunction) {

    const query = req.params['q'];
    console.log(req.params);

    if (!query) {
        return res.status(400).send({ error: 'Missing/null search query' });
    }

    next();
}

async function searchAlbums(req: Request, res: Response, next: NextFunction) {

    const query = req.params['q'];

    let results;
    try {
        results = await searchAlbum(query);
    } catch (err) {
        // return res.status(500).send({ error: err.message });
        next(err);
    }
    return res.status(200).send(results);
}

async function searchPlaylists(req: Request, res: Response, next: NextFunction) {

    const query = req.params['q'];

    let results;
    try {
        results = await searchPlaylist(query);
    } catch (err) {
        // return res.status(500).send({ error: err.message });
        next(err);
    }
    return res.status(200).send(results);
}

export default searchRouter;