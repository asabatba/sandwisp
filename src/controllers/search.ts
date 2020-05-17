
import { NextFunction, Request, Response, Router } from 'express';
import { searchAlbum } from '../logic/search';


const searchRouter = Router();

searchRouter.get('/albums/:q', searchAlbums);


async function searchAlbums(req: Request, res: Response, next: NextFunction) {

    const query = req.params['q'];

    if (!query) {
        return res.status(400).send({ error: 'Missing/null search query' });
    }

    let results;
    try {
        results = await searchAlbum(query);
    } catch (err) {
        // return res.status(500).send({ error: err.message });
        next(err);
    }
    return res.status(200).send(results);
}


export default searchRouter;