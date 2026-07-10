// Esta função roda no servidor do Netlify, não no navegador do visitante.
// Ela recebe os dados do formulário do site e repassa pro HubSpot por trás dos panos,
// evitando que bloqueadores/proteções de privacidade do navegador do celular
// interfiram na conexão direta com o HubSpot.

const HUBSPOT_PORTAL_ID = '51596754';
const HUBSPOT_FORM_GUID = '9fb8300a-7442-4235-ab3a-5f943877ad8f';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'JSON inválido' }) };
  }

  try {
    const hsResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const data = await hsResponse.json().catch(() => ({}));

    if (!hsResponse.ok) {
      console.error('HubSpot rejeitou o envio:', JSON.stringify(data));
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: false, hubspotStatus: hsResponse.status, hubspotError: data })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Erro inesperado ao contatar o HubSpot:', err);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: false, error: String(err) })
    };
  }
};
