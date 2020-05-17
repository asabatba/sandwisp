
import { NextFunction, Request, Response, Router } from 'express';
import { loadPlaylist, loadPlaylistSections } from '../logic/playlists';


const playlistsRouter = Router();

playlistsRouter.get('/:pid/sections', getPlaylistSections);

async function getPlaylistSections(req: Request, res: Response, next: NextFunction) {

    const pid = req.params['pid']?.replace(/[\W]+/g, '');

    if (!pid) {
        return res.status(400).send({ error: 'Missing/null playlistId' });
    }

    try {
        await loadPlaylist(pid);
    } catch (err) {
        // console.error(err);
        // console.error(err.response.data);
        return next(err);
        // return res.status(500).send({ error: err.message });
    }


    try {
        const sections = await loadPlaylistSections(pid);
        res.status(200).send(sections);
    } catch (err) {
        return next(err);
    }

}


export default playlistsRouter;
