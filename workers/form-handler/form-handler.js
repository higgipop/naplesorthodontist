export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsResponse();
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let data;
    try {
      data = await request.formData();
    } catch {
      return new Response('Bad request', { status: 400 });
    }

    const first   = data.get('first_name')  || '';
    const last    = data.get('last_name')   || '';
    const email   = data.get('email')       || '';
    const phone   = data.get('phone')       || '';
    const interest = data.get('interest')   || '';
    const notes   = data.get('notes')       || '';

    if (!first || !email) {
      return Response.redirect('https://naplesorthodontist.com/?error=missing', 302);
    }

    const emailBody = [
      `New lead from NaplesOrthodontist.com`,
      ``,
      `Name:     ${first} ${last}`,
      `Email:    ${email}`,
      `Phone:    ${phone || '—'}`,
      `Interest: ${interest || '—'}`,
      `Notes:    ${notes || '—'}`,
      ``,
      `Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`,
    ].join('\n');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'leads@naplesorthodontist.com',
        to:      'michael@ultradesignagency.com',
        subject: `New Lead: ${first} ${last} — ${interest || 'General Inquiry'}`,
        text:    emailBody,
      }),
    });

    if (!res.ok) {
      // Log but don't show error to user — still redirect cleanly
      console.error('Resend error:', await res.text());
    }

    return Response.redirect('https://naplesorthodontist.com/?submitted=true', 302);
  },
};

function corsResponse() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://naplesorthodontist.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
