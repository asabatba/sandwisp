
import { NextFunction, Request, Response, Router } from 'express';
import { getPlaylistData, loadPlaylist, loadPlaylistSections } from '../logic/playlists';


const playlistsRouter = Router();

playlistsRouter.get('/:pid', getPlaylist);
playlistsRouter.get('/:pid/sections', getPlaylistSections);

async function getPlaylist(req: Request, res: Response, next: NextFunction) {
    const pid = req.params['pid']?.replace(/[\W]+/g, '');

    if (!pid) {
        return res.status(400).send({ error: 'Missing/null playlistId' });
    }
    const data = await getPlaylistData(pid);
    return res.status(200).send(data);
}

async function getPlaylistSections(req: Request, res: Response, next: NextFunction) {

    const pid = req.params['pid']?.replace(/[\W]+/g, '');

    if (!pid) {
        return res.status(400).send({ error: 'Missing/null playlistId' });
    }

    try {
        await loadPlaylist(pid);
    } catch (err) {
        return next(err);
    }

    try {
        const sections = await loadPlaylistSections(pid);
        res.status(200).send(sections);
    } catch (err) {
        return next(err);
    }

}


export default playlistsRouter;
