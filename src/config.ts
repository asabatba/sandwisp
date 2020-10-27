
import { config } from 'dotenv';
config();


export const API_PORT = process.env.SERVER_API_PORT;
// export const SERVER_KEY = process.env.SERVER_KEY;
// export const SERVER_CERT = process.env.SERVER_CERT;

export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_KEY = process.env.SPOTIFY_CLIENT_KEY;

export default { API_PORT, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_KEY };
