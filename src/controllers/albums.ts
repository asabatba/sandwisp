
import { NextFunction, Request, Response, Router } from 'express';
import { getAlbumData, loadAlbum, loadAlbumSections } from '../logic/albums';
import { firstParam } from './params';


const albumsRouter = Router();

albumsRouter.get('/:aid', getAlbum);
albumsRouter.get('/:aid/sections', getAlbumSections);

async function getAlbum(req: Request, res: Response, next: NextFunction) {
    const aid = firstParam(req.params['aid'])?.replace(/[\W]+/g, '');

    if (!aid) {
        return res.status(400).send({ error: 'Missing/null albumId' });
    }
    const data = await getAlbumData(aid);
    return res.status(200).send(data);
}

async function getAlbumSections(req: Request, res: Response, next: NextFunction) {

    const aid = firstParam(req.params['aid'])?.replace(/[\W]+/g, '');

    if (!aid) {
        return res.status(400).send({ error: 'Missing/null albumId' });
    }

    try {
        await loadAlbum(aid);
    } catch (err) {
        return next(err);
    }

    const sections = await loadAlbumSections(aid);

    res.status(200).send(sections);
}


export default albumsRouter;
