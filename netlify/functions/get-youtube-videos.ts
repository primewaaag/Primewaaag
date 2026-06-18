import { Handler } from '@netlify/functions';

const fallbackVideos = [
  {
    title: "How to Program High-Performance Stream Widgets From Scratch (Full Architecture)",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Setting up Streamer.bot & OBS Studio for Custom Overlays & Alerts",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Unlocking Premium Widgets: Custom Alerts & Integrations Tutorial",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
  }
];

export const handler: Handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    // 1. Fetch the YouTube Channel landing page
    const channelUrl = 'https://www.youtube.com/@primewaaag';
    const ytResponse = await fetch(channelUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!ytResponse.ok) {
      throw new Error(`Failed to fetch channel landing page: ${ytResponse.status}`);
    }

    const html = await ytResponse.text();

    // 2. Extract the Channel ID from HTML
    const channelIdMatch = 
      html.match(/<meta itemprop="channelId" content="(UC[A-Za-z0-9_-]{22})">/) ||
      html.match(/"channelId":"(UC[A-Za-z0-9_-]{22})"/);

    if (!channelIdMatch) {
      console.log('Channel ID not found in page HTML. Returning fallback videos.');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackVideos)
      };
    }

    const channelId = channelIdMatch[1];
    console.log(`Successfully resolved channel ID: ${channelId}`);

    // 3. Fetch RSS Feed
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const feedResponse = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });

    if (!feedResponse.ok) {
      throw new Error(`Failed to fetch XML RSS feed: ${feedResponse.status}`);
    }

    const xmlText = await feedResponse.text();

    // 4. Parse XML utilizing lightweight regexes
    const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    if (entries.length === 0) {
      console.log('No video entries found in RSS feed. Returning fallback videos.');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackVideos)
      };
    }

    const videos = entries.slice(0, 3).map(entry => {
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = entry.match(/<link[^>]*?href="([^"]*?)"/);
      const thumbMatch = entry.match(/<media:thumbnail[^>]*?url="([^"]*?)"/);

      let title = titleMatch ? titleMatch[1] : 'YouTube Video';
      // Basic XML entities decode
      title = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      return {
        title,
        url: linkMatch ? linkMatch[1] : 'https://youtube.com',
        thumbnail: thumbMatch ? thumbMatch[1] : 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80'
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(videos)
    };

  } catch (error: any) {
    console.error('get-youtube-videos function error:', error.message || error);
    // Graceful fallback to guarantee page stability
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallbackVideos)
    };
  }
};
