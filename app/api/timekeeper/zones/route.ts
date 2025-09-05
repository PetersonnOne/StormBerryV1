import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { Redis } from '@upstash/redis';

// Disable Redis for now to prevent build errors
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

const CACHE_TTL = 3600; // 1 hour in seconds

interface TimeZoneData {
  id: string;
  name: string;
  offset: string;
  currentTime: string;
  isDST: boolean;
}

async function fetchFromWorldTimeAPI(zone: string) {
  const response = await fetch(`http://worldtimeapi.org/api/timezone/${zone}`);
  if (!response.ok) throw new Error('Failed to fetch from WorldTimeAPI');
  return response.json();
}

async function fetchFromSavvyCal(query: string) {
  // TODO: Implement SavvyCal API integration
  return [];
}

async function fetchFromAbstractAPI(datetime: string, fromZone: string, toZone: string) {
  // TODO: Implement Abstract API integration
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Check cache first (disabled)
    // const cachedData = await redis.get(`timezone:${query}`);
    // if (cachedData) {
    //   return NextResponse.json(cachedData);
    // }

    // Fetch from primary API
    let data;
    try {
      data = await fetchFromWorldTimeAPI(query);
    } catch (error) {
      // Fallback to SavvyCal
      try {
        data = await fetchFromSavvyCal(query);
      } catch (fallbackError) {
        return NextResponse.json({ error: 'Failed to fetch timezone data' }, { status: 500 });
      }
    }

    // Cache the result (disabled)
    // await redis.set(`timezone:${query}`, data, { ex: CACHE_TTL });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { datetime, fromZone, toZone } = body;

    if (!datetime || !fromZone || !toZone) {
      return NextResponse.json(
        { error: 'datetime, fromZone, and toZone are required' },
        { status: 400 }
      );
    }

    // Check cache (disabled)
    // const cacheKey = `conversion:${datetime}:${fromZone}:${toZone}`;
    // const cachedResult = await redis.get(cacheKey);
    // if (cachedResult) {
    //   return NextResponse.json(cachedResult);
    // }

    // Perform conversion
    let result;
    try {
      result = await fetchFromAbstractAPI(datetime, fromZone, toZone);
    } catch (error) {
      // Implement fallback logic
      return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
    }

    // Cache the result (disabled)
    // await redis.set(cacheKey, result, { ex: CACHE_TTL });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}