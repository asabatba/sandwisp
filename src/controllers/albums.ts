
import { NextFunction, Request, Response, Router } from 'express';
import { loadAlbum, loadAlbumSections } from '../logic/albums';


const albumsRouter = Router();

albumsRouter.get('/:aid/sections', getAlbumSections);

async function getAlbumSections(req: Request, res: Response, next: NextFunction) {

    const aid = req.params['aid']?.replace(/[\W]+/g, '');

    if (!aid) {
        return res.status(400).send({ error: 'Missing/null albumId' });
    }

    try {
        await loadAlbum(aid);
    } catch (err) {
        // console.error(err);
        // console.error(err.response.data);
        return next(err);
        // return res.status(500).send({ error: err.message });
    }

    const sections = await loadAlbumSections(aid);

    res.status(200).send(sections);
}


export default albumsRouter;
