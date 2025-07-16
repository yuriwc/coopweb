import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('place_id');
  
  if (!placeId) {
    return NextResponse.json({ error: 'place_id parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY not found in environment variables');
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }
  
  console.log('API Key found, making request to Google Maps API');

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('fields', 'name,formatted_address,geometry,place_id,address_components');
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