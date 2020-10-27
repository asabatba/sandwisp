
import { config } from 'dotenv';
config();

export const API_PORT = process.env.SERVER_API_PORT;
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_KEY = process.env.SPOTIFY_CLIENT_KEY;

export const {
    DB_CLIENT,
    DB_DATABASE,
    DB_USER,
    DB_PASSWORD,
} = process.env;

export default { API_PORT, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_KEY };
