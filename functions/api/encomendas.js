const COLS = ['cliente','contacto','tipo','qtd','preco','data','entrega','estado','obs'];
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json' } });

export async function onRequest({ request, env }) {
  if (!env.PIN || request.headers.get('x-pin') !== env.PIN) return json({ error: 'PIN inválido' }, 401);
  const m = request.method;
  const id = new URL(request.url).searchParams.get('id');
  try {
    if (m === 'GET') {
      const r = await env.DB.prepare('SELECT * FROM encomendas ORDER BY id DESC').all();
      return json(r.results);
    }
    if (m === 'POST' || m === 'PUT') {
      const b = await request.json();
      if (!b.cliente || !b.tipo) return json({ error: 'cliente e tipo são obrigatórios' }, 400);
      const v = COLS.map(c => b[c] ?? '');
      if (m === 'POST') {
        const r = await env.DB.prepare(`INSERT INTO encomendas (${COLS.join(',')}) VALUES (${COLS.map(() => '?').join(',')})`).bind(...v).run();
        return json({ id: r.meta.last_row_id }, 201);
      }
      if (id) {
        await env.DB.prepare(`UPDATE encomendas SET ${COLS.map(c => c + '=?').join(',')} WHERE id=?`).bind(...v, id).run();
        return json({ ok: true });
      }
    }
    if (m === 'DELETE' && id) {
      await env.DB.prepare('DELETE FROM encomendas WHERE id=?').bind(id).run();
      return json({ ok: true });
    }
    return json({ error: 'pedido inválido' }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}
