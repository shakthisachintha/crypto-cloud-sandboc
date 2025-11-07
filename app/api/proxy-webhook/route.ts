import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { callbackUrl, payload } = body;

    if (!callbackUrl) {
      return NextResponse.json(
        { error: 'Callback URL is required' },
        { status: 400 }
      );
    }

    // Create URL-encoded form data
    const formData = new URLSearchParams(payload);

    // Forward the request to the callback URL
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'CryptoCloud-Webhook-Simulator/1.0',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });
  } catch (error) {
    console.error('Proxy webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
