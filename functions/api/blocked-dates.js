export async function onRequestGet(context) {
  const stored = await context.env.BOOKINGS.get('blocked-dates');
  const dates = stored ? JSON.parse(stored) : [];
  return Response.json({ dates });
}

export async function onRequestPost(context) {
  const body = await context.request.json();
  const stored = await context.env.BOOKINGS.get('blocked-dates');
  let dates = stored ? JSON.parse(stored) : [];

  if (body.action === 'add' && !dates.includes(body.date)) {
    dates.push(body.date);
  } else if (body.action === 'remove') {
    dates = dates.filter(d => d !== body.date);
  }

  await context.env.BOOKINGS.put('blocked-dates', JSON.stringify(dates));
  return Response.json({ ok: true });
}
