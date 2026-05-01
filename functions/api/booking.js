export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const data = {
      name:      String(formData.get('name')     || '').trim(),
      email:     String(formData.get('email')    || '').trim(),
      phone:     String(formData.get('phone')    || '').trim(),
      date:      String(formData.get('date')     || '').trim(),
      guests:    String(formData.get('guests')   || '').trim(),
      occasion:  String(formData.get('occasion') || '').trim(),
      message:   String(formData.get('message')  || '').trim(),
      receivedAt: new Date().toISOString(),
    };
    const required = ['name','email','phone','date','guests','occasion'];
    for (const field of required) {
      if (!data[field]) return Response.json({ error: `Pflichtfeld fehlt: ${field}` }, { status: 400 });
    }
    return Response.json({ ok: true, message: 'Buchungsanfrage erfolgreich empfangen.', reference: `GH-${Date.now()}` });
  } catch(err) {
    return Response.json({ error: 'Serverfehler. Bitte versuche es erneut.' }, { status: 500 });
  }
}
