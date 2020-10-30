
import { config } from 'dotenv';
import knexfile from './knexfile';
config();

export const API_PORT = process.env.SERVER_API_PORT;
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_KEY = process.env.SPOTIFY_CLIENT_KEY;


export let knexConfig: any;
switch (process.env.NODE_ENV) {
    case 'development':
        knexConfig = knexfile.production;
        break;
    case 'production':
    default:
        knexConfig = knexfile.production;
        break;
}


export default { API_PORT, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_KEY };
