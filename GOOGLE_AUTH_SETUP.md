
# Google Sign-In Setup (Web + API)

## 1) Google Cloud Console
- Create an OAuth 2.0 Client of type **Web application**.
- Add Authorized JavaScript origins for your web app (e.g., http://localhost:3000).
- Copy the **Client ID**.

## 2) Web (.env.local)
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```
Restart `npm run dev` after saving.

## 3) API (.env or environment)
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
APP_BASE_URL=http://127.0.0.1:3001
WEB_BASE_URL=http://localhost:3000
JWT_SECRET=choose-a-strong-secret
```
Install the new dependency:
```
cd api
npm i
```
Then build/run the API.

## 4) How it works
- The **Continue with Google** button loads Google Identity Services and starts the sign-in.
- We get an **ID Token** (JWT) from Google in the browser.
- The browser POSTs the token to `/api/auth/google-login` (proxied to the API).
- The API verifies the token using Google public keys, creates/fetches a user, sets the auth cookie, and returns basic user info.
- The web redirects to `/resident/dashboard` or `/staff/dashboard` based on user type.
