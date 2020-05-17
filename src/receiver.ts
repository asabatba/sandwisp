
import { AxiosError } from 'axios';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import slowDown from 'express-slow-down';
import { readFileSync } from 'fs';
import https from 'https';
import { API_PORT } from './config';
import albumsRouter from './controllers/albums';
import searchRouter from './controllers/search';

const app = express();

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 100, // allow 100 requests per 15 minutes, then...
    delayMs: 500 // begin adding 500ms of delay per request above 100:
});

//  apply to all requests
app.use(cors());
app.use(speedLimiter);

app.use('/api/albums', albumsRouter);
app.use('/api/search', searchRouter);

(() => {
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
    httpsServer.listen(API_PORT);
})();

const errorHandler = (error: Error | AxiosError, request: Request, response: Response, next: NextFunction) => {

    console.error(error);

    if ('isAxiosError' in error) {
        // error.
    }

    return response.status(500).send({ error: error.message });
    // if (error.name === 'CastError') {
    //     return response.status(400).send({ error: 'malformatted id' });
    // }

    next(error);
};

app.use(errorHandler);