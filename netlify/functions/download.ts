import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return {
      statusCode: 400,
      body: 'URL parameter is required',
    };
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from source: ${response.statusText}`);
    }

    // Extract original filename from URL
    let name = 'download';
    try {
      if (url.includes('/o/')) {
        const pathPart = url.split('/o/')[1].split('?')[0];
        name = decodeURIComponent(pathPart).split('/').pop() || 'download';
      } else {
        name = url.split('/').pop()?.split('?')[0] || 'download';
      }
    } catch (_) {}

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${name}"`,
        'Access-Control-Allow-Origin': '*',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error: any) {
    console.error('Download proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
