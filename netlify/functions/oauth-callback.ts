import { Handler } from '@netlify/functions';
import crypto from 'crypto';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { code, platform, redirectUri } = body;

    if (!code || !platform || !redirectUri) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'code, platform, and redirectUri are required.' })
      };
    }

    let id = '';
    let email = '';
    let username = '';
    let avatar = '';

    if (platform === 'twitch') {
      const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
      const clientSecret = process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Twitch Client ID or Secret is not configured on the server. Make sure you set both TWITCH_CLIENT_ID (or NEXT_PUBLIC_TWITCH_CLIENT_ID) and TWITCH_CLIENT_SECRET in your .env file, then restart your Netlify dev server.' })
        };
      }

      // 1. Exchange code for access token
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Twitch token exchange failed: ${errText}`);
      }

      const tokenData: any = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 2. Fetch Twitch user profile
      const userResponse = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': clientId
        }
      });

      if (!userResponse.ok) {
        const errText = await userResponse.text();
        throw new Error(`Twitch user fetch failed: ${errText}`);
      }

      const userData: any = await userResponse.json();
      const twitchUser = userData.data?.[0];

      if (!twitchUser) {
        throw new Error('No Twitch user profile returned.');
      }

      id = twitchUser.id;
      username = twitchUser.display_name || twitchUser.login;
      email = twitchUser.email || `${id}@twitch.primewaaag.gg`;
      avatar = twitchUser.profile_image_url || '';

    } else if (platform === 'discord') {
      const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
      const clientSecret = process.env.NEXT_PUBLIC_DISCORD_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Discord Client ID or Secret is not configured on the server. Make sure you set both DISCORD_CLIENT_ID (or NEXT_PUBLIC_DISCORD_CLIENT_ID) and DISCORD_CLIENT_SECRET in your .env file, then restart your Netlify dev server.' })
        };
      }

      // 1. Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Discord token exchange failed: ${errText}`);
      }

      const tokenData: any = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // 2. Fetch Discord user profile
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!userResponse.ok) {
        const errText = await userResponse.text();
        throw new Error(`Discord user fetch failed: ${errText}`);
      }

      const discordUser: any = await userResponse.json();
      id = discordUser.id;
      username = discordUser.global_name || discordUser.username;
      email = discordUser.email || `${id}@discord.primewaaag.gg`;

      if (discordUser.avatar) {
        avatar = `https://cdn.discordapp.com/avatars/${id}/${discordUser.avatar}.png`;
      } else {
        const defaultIndex = (BigInt(id) >> BigInt(22)) % BigInt(6);
        avatar = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
      }
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid platform. Only twitch and discord are supported.' })
      };
    }

    // 3. Generate deterministic secure password for Firebase Authentication (keyed off email to unify Twitch/Discord profiles)
    const salt = process.env.OAUTH_PASSWORD_SALT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'primewaaag_default_salt_123';
    const hash = crypto
      .createHmac('sha256', salt)
      .update(email.toLowerCase())
      .digest('hex');
    const password = `OAuthPw_${hash.substring(0, 20)}_Safe!`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        email,
        password,
        username,
        avatar,
        id
      })
    };

  } catch (error: any) {
    console.error('oauth-callback error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
