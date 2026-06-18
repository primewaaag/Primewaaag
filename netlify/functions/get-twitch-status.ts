import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Twitch Client ID or Secret is not configured.' })
      };
    }

    // 1. Obtain Twitch App Access Token (Client Credentials Grant)
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Failed to get Twitch app access token: ${errText}`);
    }

    const tokenData: any = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Query Helix streams for the channel user login "primewaaag"
    const streamResponse = await fetch('https://api.twitch.tv/helix/streams?user_login=primewaaag', {
      headers: {
        'Client-Id': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!streamResponse.ok) {
      const errText = await streamResponse.text();
      throw new Error(`Failed to fetch Twitch stream status: ${errText}`);
    }

    const streamData: any = await streamResponse.json();
    const isLive = streamData.data && streamData.data.length > 0;
    const streamInfo = isLive ? streamData.data[0] : null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        isLive,
        stream: streamInfo
      })
    };
  } catch (error: any) {
    console.error('get-twitch-status error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
