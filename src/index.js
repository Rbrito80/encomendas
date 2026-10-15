const H = ['cliente','contacto','morada','data','entrega','estado','obs'];
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json' } });

async function handle(request, env, url) {
  // PIN opcional: só é exigido se existir o Secret PIN
  if (env.PIN && request.headers.get('x-pin') !== env.PIN) return json({ error: 'PIN inválido' }, 401);
  const m = request.method, id = url.searchParams.get('id');
  try {
    if (m === 'GET') {
      const [p, l] = await Promise.all([
        env.DB.prepare('SELECT * FROM pedidos ORDER BY id DESC').all(),
        env.DB.prepare('SELECT * FROM linhas ORDER BY id').all()
      ]);
      const by = {};
      for (const x of l.results) (by[x.pedido_id] ??= []).push(x);
      return json(p.results.map(o => ({ ...o, linhas: by[o.id] || [] })));
    }
    if (m === 'DELETE' && id) {
      await env.DB.batch([
        env.DB.prepare('DELETE FROM linhas WHERE pedido_id=?').bind(id),
        env.DB.prepare('DELETE FROM pedidos WHERE id=?').bind(id)
      ]);
      return json({ ok: true });
    }
    if (m === 'POST' || m === 'PUT') {
      const b = await request.json();
      const ls = (b.linhas || []).filter(x => x.tipo);
      if (!b.cliente || !ls.length) return json({ error: 'cliente e pelo menos uma linha são obrigatórios' }, 400);
      const v = H.map(c => b[c] ?? '');
      const ins = pid => ls.map(x => env.DB.prepare('INSERT INTO linhas (pedido_id,tipo,qtd,preco) VALUES (?,?,?,?)')
        .bind(pid, String(x.tipo), Number(x.qtd) || 1, Number(x.preco) || 0));
      if (m === 'POST') {
        const r = await env.DB.prepare(`INSERT INTO pedidos (${H.join(',')}) VALUES (${H.map(() => '?').join(',')})`).bind(...v).run();
        const pid = r.meta.last_row_id;
        await env.DB.batch(ins(pid));
        return json({ id: pid }, 201);
      }
      if (id) {
        await env.DB.batch([
          env.DB.prepare(`UPDATE pedidos SET ${H.map(c => c + '=?').join(',')} WHERE id=?`).bind(...v, id),
          env.DB.prepare('DELETE FROM linhas WHERE pedido_id=?').bind(id),
          ...ins(id)
        ]);
        return json({ ok: true });
      }
    }
    return json({ error: 'pedido inválido' }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/encomendas') return handle(request, env, url);
    return env.ASSETS.fetch(request);
  }
};
