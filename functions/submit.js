export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.formData();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const first    = data.get('first_name') || '';
  const last     = data.get('last_name')  || '';
  const email    = data.get('email')      || '';
  const phone    = data.get('phone')      || '';
  const interest = data.get('interest')   || '';
  const notes    = data.get('notes')      || '';

  if (!first || !email) {
    return Response.redirect('https://naplesorthodontist.com/?error=missing', 302);
  }

  const body = [
    `New lead — NaplesOrthodontist.com`,
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
      text:    body,
    }),
  });

  if (!res.ok) {
    console.error('Resend error:', await res.text());
  }

  return Response.redirect('https://naplesorthodontist.com/?submitted=true', 302);
}
