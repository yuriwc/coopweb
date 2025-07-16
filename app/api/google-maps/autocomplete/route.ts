import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  
  if (!input) {
    return NextResponse.json({ error: 'Input parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY not found in environment variables');
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }
  
  console.log('API Key found, making request to Google Maps API');

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('input', input);
    url.searchParams.append('components', 'country:br');
    url.searchParams.append('types', 'establishment|geocode');
    url.searchParams.append('language', 'pt-BR');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Google Maps API error' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Google Maps data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}