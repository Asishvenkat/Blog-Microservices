import {google} from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.Google_Client_id;
const GOOGLE_CLIENT_SECRET = process.env.Google_client_secret;
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3000";

export const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);