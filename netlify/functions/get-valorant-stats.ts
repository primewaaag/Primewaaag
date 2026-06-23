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

  const apiKey = process.env.VALORANT_API_KEY || process.env.NEXT_PUBLIC_VALORANT_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'VALORANT_API_KEY environment variable is not configured. Please get a free key from api.henrikdev.xyz/dashboard and configure it.' })
    };
  }

  try {
    // 1. Fetch MMR / Ranks
    const mmrRes = await fetch('https://api.henrikdev.xyz/valorant/v2/mmr/eu/CheeksClapper/74738', {
      headers: { 'Authorization': apiKey }
    });

    if (!mmrRes.ok) {
      throw new Error(`MMR API returned status ${mmrRes.status}. Check if your API key is active/valid.`);
    }

    const mmrJson = await mmrRes.json();
    const mmrData = mmrJson.data;
    if (!mmrData) {
      throw new Error('Valorant MMR data was empty or invalid.');
    }

    // 2. Fetch Matches (only competitive)
    const matchesRes = await fetch('https://api.henrikdev.xyz/valorant/v3/matches/eu/CheeksClapper/74738?size=5&mode=competitive', {
      headers: { 'Authorization': apiKey }
    });

    if (!matchesRes.ok) {
      throw new Error(`Matches API returned status ${matchesRes.status}`);
    }

    const matchesJson = await matchesRes.json();
    const matchesData = matchesJson.data;

    if (!matchesData || !Array.isArray(matchesData) || matchesData.length === 0) {
      throw new Error('Valorant match history data was empty or invalid.');
    }

    // Parse Live MMR/Ranks
    const currentRank = mmrData.current_data?.currenttierpatched;
    const currentRankImg = mmrData.current_data?.images?.small;
    if (!currentRank || !currentRankImg) {
      throw new Error('Required live MMR rank information is missing.');
    }

    const peakRank = mmrData.highest_rank?.patched_tier || null;
    const peakRankImg = mmrData.highest_rank?.tier 
      ? `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${mmrData.highest_rank.tier}/largeicon.png`
      : null;
    if (!peakRank || !peakRankImg) {
      throw new Error('Required peak rank information is missing.');
    }

    // Parse Live Matches
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalHeadshots = 0;
    let totalBodyshots = 0;
    let totalLegshots = 0;
    let winsCount = 0;

    const parsedGames = matchesData.map((match: any) => {
      const metadata = match.metadata || {};
      const allPlayers = match.players?.all_players || [];
      const userPlayer = allPlayers.find((p: any) => p.name.toLowerCase() === 'cheeksclapper' && p.tag === '74738');
      
      if (!userPlayer) {
        throw new Error('User player CheeksClapper#74738 not found in match data.');
      }
      
      const stats = userPlayer.stats || {};
      const teamColor = userPlayer.team || 'Red';
      const teamStats = match.teams?.[teamColor.toLowerCase()];
      
      const result = teamStats?.has_won ? 'WIN' : 'LOSS';

      if (teamStats?.has_won) winsCount++;
      totalKills += stats.kills || 0;
      totalDeaths += stats.deaths || 0;
      totalAssists += stats.assists || 0;
      totalHeadshots += stats.headshots || 0;
      totalBodyshots += stats.bodyshots || 0;
      totalLegshots += stats.legshots || 0;

      const totalShots = (stats.headshots || 0) + (stats.bodyshots || 0) + (stats.legshots || 0);
      const hsRate = totalShots > 0 ? `${((stats.headshots / totalShots) * 100).toFixed(1)}%` : '0.0%';

      const score = (teamStats && typeof teamStats.rounds_won === 'number')
        ? `${teamStats.rounds_won}-${teamStats.rounds_lost || 0}`
        : `${stats.kills || 0} Kills`;

      return {
        map: metadata.map || 'Unknown Map',
        mode: (metadata.mode || 'UNRATED').toUpperCase(),
        agentName: userPlayer.character || 'Iso',
        agentIcon: userPlayer.assets?.agent?.small || 'https://media.valorant-api.com/agents/0e3b61b5-4c1d-610e-ca28-ca9b7ca80064/displayicon.png',
        result,
        score,
        kda: `${stats.kills || 0}/${stats.deaths || 0}/${stats.assists || 0}`,
        hsRate,
        date: metadata.game_start_patched || new Date().toLocaleString(),
        kills: stats.kills || 0,
        deaths: stats.deaths || 0,
        assists: stats.assists || 0,
        headshots: stats.headshots || 0,
        bodyshots: stats.bodyshots || 0,
        legshots: stats.legshots || 0
      };
    });

    const formatSeason = (seasonStr: string) => {
      if (!seasonStr) return '';
      const match = seasonStr.match(/^e(\d+)a(\d+)$/i);
      if (match) {
        return `EPISODE ${match[1]} • ACT ${match[2]}`;
      }
      return seasonStr.toUpperCase();
    };

    const gamesCount = parsedGames.length || 1;
    const avgKills = (totalKills / gamesCount).toFixed(1);
    const avgDeaths = (totalDeaths / gamesCount).toFixed(1);
    const avgAssists = (totalAssists / gamesCount).toFixed(1);

    const parsedStats = {
      hsRate: totalHeadshots + totalBodyshots + totalLegshots > 0 
        ? `${((totalHeadshots / (totalHeadshots + totalBodyshots + totalLegshots)) * 100).toFixed(1)}%`
        : '0.0%',
      kdRatio: totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : '0.00',
      winrate: parsedGames.length > 0 ? `${((winsCount / parsedGames.length) * 100).toFixed(1)}%` : '0.0%',
      kdaRatio: `${avgKills}/${avgDeaths}/${avgAssists}`,
      peakRankName: mmrData.highest_rank?.patched_tier || 'Unranked',
      peakRankImg: mmrData.highest_rank?.tier 
        ? `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${mmrData.highest_rank.tier}/largeicon.png`
        : '',
      peakSeason: mmrData.highest_rank?.season ? formatSeason(mmrData.highest_rank.season) : ''
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        live: true,
        ranks: [
          {
            game: 'Valorant',
            currentRank,
            currentRankImg,
            peakRank,
            peakRankImg,
            theme: 'via-cyan-500/30',
            bg: 'bg-cyan-500/5',
            border: 'border-cyan-500/20'
          },
          {
            game: 'Brawl Stars',
            currentRank: 'Masters',
            currentRankImg: 'https://static.wikia.nocookie.net/brawlstars/images/e/e7/Masters_Rank.png',
            peakRank: 'Masters',
            peakRankImg: 'https://static.wikia.nocookie.net/brawlstars/images/e/e7/Masters_Rank.png',
            theme: 'via-purple-500/30',
            bg: 'bg-purple-500/5',
            border: 'border-purple-500/20'
          }
        ],
        stats: parsedStats,
        games: parsedGames
      })
    };

  } catch (error: any) {
    console.error('get-valorant-stats live fetch error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Failed to fetch live Valorant stats.' })
    };
  }
};
