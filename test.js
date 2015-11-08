const quo = require('./');
const fetch = require('node-fetch');
const Koa = require('koa');

const desc = require('macchiato');
const port = 9879;

desc('quo')
.beforeEach(t => {
  t.app = new Koa();
  t.server = t.app.listen(port);
})
.afterEach(t => t.server.close())
.should('return value returned from fn', t => {
  t.app.use(quo(() => 'abcd'));

  return fetch(`http://localhost:${port}`)
    .then(res => res.text())
    .then(d => t.equals(d, 'abcd'));
})
.should('return successful promise value', t => {
  t.app.use(quo(() => Promise.resolve({ a: 1 })));

  return fetch(`http://localhost:${port}`)
    .then(res => res.json())
    .then(d => t.eqls(d, { a: 1 }));
})
.should('respond with 500 if error thrown', t => {
  t.app.silent = true;

  t.app.use(quo(() => {
    throw new Error('Broken');
  }));

  return fetch(`http://localhost:${port}`).then(res => {
    t.equals(res.status, 500);
    return res.text().then(d => t.equals(d, 'Internal Server Error'));
  });
})
.should('respond with 500 if promise rejected', t => {
  t.app.silent = true;

  t.app.use(quo(() => Promise.reject(new Error('Broken'))));

  return fetch(`http://localhost:${port}`).then(res => {
    t.equals(res.status, 500);
    return res.text().then(d => t.equals(d, 'Internal Server Error'));
  });
})
.should('respond pass ctx and allow changes', t => {
  t.app.use(quo(ctx => {
    ctx.status = 418;
    return Promise.resolve('I\'m a teapot');
  }));

  return fetch(`http://localhost:${port}`).then(res => {
    t.equals(res.status, 418);
    return res.text().then(d => t.equals(d, 'I\'m a teapot'));
  });
})
.should('call onError method on error if supplied', t => {
  t.app.silent = true;

  const handle = quo(
    () => Promise.reject(new Error('Broken')),
    (err, ctx) => {
      ctx.status = 510;
      return Promise.resolve('Not Extended');
    }
  );
  t.app.use(handle);

  return fetch(`http://localhost:${port}`).then(res => {
    t.equals(res.status, 510);
    return res.text().then(d => t.equals(d, 'Not Extended'));
  });
});
