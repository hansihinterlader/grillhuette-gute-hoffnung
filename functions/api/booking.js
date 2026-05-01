export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const data = {
      name:     String(formData.get('name')     || '').trim(),
      email:    String(formData.get('email')    || '').trim(),
      phone:    String(formData.get('phone')    || '').trim(),
      date:     String(formData.get('date')     || '').trim(),
      guests:   String(formData.get('guests')   || '').trim(),
      occasion: String(formData.get('occasion') || '').trim(),
      message:  String(formData.get('message')  || '').trim(),
    };

    // E-Mail senden via MailChannels
    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'hansi.hinterlader@googlemail.com', name: 'Grillhütte Gute Hoffnung' }]
        }],
        from: { email: 'buchung@grillhuette-gute-hoffnung.pages.dev', name: 'Buchungsanfrage' },
        subject: `Neue Buchungsanfrage von ${data.name} – ${data.date}`,
        content: [{
          type: 'text/plain',
          value: `
Neue Buchungsanfrage!

Name:        ${data.name}
E-Mail:      ${data.email}
Telefon:     ${data.phone}
Datum:       ${data.date}
Personen:    ${data.guests}
Anlass:      ${data.occasion}
Nachricht:   ${data.message}
          `.trim()
        }]
      })
    });

    return Response.json({ ok: true, message: 'Anfrage erfolgreich gesendet.' });

  } catch(err) {
    return Response.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
