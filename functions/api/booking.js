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

    const required = ['name','email','phone','date','guests','occasion'];
    for (const field of required) {
      if (!data[field]) return Response.json({ error: `Pflichtfeld fehlt: ${field}` }, { status: 400 });
    }

    const RESEND_API_KEY = context.env.RESEND_API_KEY;

    // E-Mail ans Grillhütten-Team
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Grillhütte Buchung <onboarding@resend.dev>',
        to: ['hansi.hinterlader@googlemail.com'],
        subject: `🔥 Neue Buchungsanfrage – ${data.name} am ${data.date}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0b1a11;color:#e8f5ee;padding:32px;border-radius:16px">
            <h1 style="color:#ff7a18;margin-bottom:8px">🔥 Neue Buchungsanfrage</h1>
            <p style="color:#9dbdac;margin-bottom:24px">Grillhütte „Gute Hoffnung" Münster</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:12px;border-bottom:1px solid #1a3a25;color:#9dbdac;width:120px">👤 Name</td><td style="padding:12px;border-bottom:1px solid #1a3a25;font-weight:bold">${data.name}</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid #1a3a25;color:#9dbdac">📧 E-Mail</td><td style="padding:12px;border-bottom:1px solid #1a3a25"><a href="mailto:${data.email}" style="color:#ff7a18">${data.email}</a></td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid #1a3a25;color:#9dbdac">📞 Telefon</td><td style="padding:12px;border-bottom:1px solid #1a3a25"><a href="tel:${data.phone}" style="color:#ff7a18">${data.phone}</a></td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid #1a3a25;color:#9dbdac">📅 Datum</td><td style="padding:12px;border-bottom:1px solid #1a3a25;font-weight:bold;color:#ffb347">${data.date}</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid #1a3a25;color:#9dbdac">👥 Personen</td><td style="padding:12px;border-bottom:1px solid #1a3a25">${data.guests}</td></tr>
              <tr><td style="padding:12px;border-bottom:1px solid #1a3a25;color:#9dbdac">🎉 Anlass</td><td style="padding:12px;border-bottom:1px solid #1a3a25">${data.occasion}</td></tr>
              <tr><td style="padding:12px;color:#9dbdac;vertical-align:top">💬 Nachricht</td><td style="padding:12px">${data.message || '–'}</td></tr>
            </table>
            <div style="margin-top:24px;padding:16px;background:#1a3a25;border-radius:12px">
              <p style="margin:0;color:#9dbdac;font-size:14px">Direkt antworten: <a href="mailto:${data.email}" style="color:#ff7a18">${data.email}</a> · <a href="tel:${data.phone}" style="color:#ff7a18">${data.phone}</a></p>
            </div>
          </div>
        `
      })
    });

    // Bestätigungs-Mail an den Anfragenden
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Grillhütte Gute Hoffnung <onboarding@resend.dev>',
        to: [data.email],
        subject: `✅ Deine Anfrage bei der Grillhütte „Gute Hoffnung"`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0b1a11;color:#e8f5ee;padding:32px;border-radius:16px">
            <h1 style="color:#ff7a18">🔥 Danke, ${data.name}!</h1>
            <p style="color:#9dbdac;line-height:1.7">Deine Anfrage ist bei uns eingegangen. Wir melden uns schnellstmöglich bei dir!</p>
            <div style="background:#1a3a25;border-radius:12px;padding:20px;margin:24px 0">
              <p style="margin:0 0 8px;color:#9dbdac">Deine Anfrage:</p>
              <p style="margin:4px 0">📅 <strong>${data.date}</strong></p>
              <p style="margin:4px 0">👥 <strong>${data.guests} Personen</strong></p>
              <p style="margin:4px 0">🎉 <strong>${data.occasion}</strong></p>
            </div>
            <div style="border-top:1px solid #1a3a25;padding-top:20px;margin-top:20px">
              <p style="color:#9dbdac;font-size:14px">📞 0155-605 62 116<br>Mo/Fr: 18:30–21:00 · Sa: 13:00–20:00</p>
              <p style="color:#9dbdac;font-size:14px">✉️ ghv.muenster1976@gmx.de</p>
            </div>
          </div>
        `
      })
    });

    return Response.json({ ok: true, message: 'Buchungsanfrage erfolgreich gesendet.' });

  } catch(err) {
    return Response.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
