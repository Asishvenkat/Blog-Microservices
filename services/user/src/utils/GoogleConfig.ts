import {google} from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.Google_Client_id;
const GOOGLE_CLIENT_SECRET = process.env.Google_client_secret;
const DEFAULT_REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:3000/login";

// Factory to create an OAuth client per request, allowing dynamic redirect URIs.
export const createOAuthClient = (redirectUri?: string) =>
    new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        redirectUri || DEFAULT_REDIRECT_URI
    );