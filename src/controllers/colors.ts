
import bodyParser from 'body-parser';
import { NextFunction, Request, Response, Router } from 'express';
import { imgPalette } from '../logic/colors';

const colorsRouter = Router();

colorsRouter.use(bodyParser.json());
colorsRouter.post('/palette', postPalette);

async function postPalette(req: Request, res: Response, next: NextFunction) {

    const imgUrl = req.body.url;

    try {
        const palette = await imgPalette(imgUrl);
        return res.send(palette);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ err });
    }

}

export default colorsRouter;