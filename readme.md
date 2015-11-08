# Quo

Simple async responses in Koa

### Install
```bash
$ npm i quo
```

This module provides some syntactic sugar for simple asynchronous responses.
```javascript
const app = new Koa();
app.listen(8080);

// fat arrow functions can be supplied
// and the return value is set to `context.body`
app.use(quo(() => 'abcd'));

fetch('http://localhost:8080')
  .then(res => res.text())
  .then(d => /* d === 'abcd' */);
```

Return async stuff:
```javascript
app.use(quo(() => Promise.resolve('abcd')));
```
If you are using async functions:
```javascript
app.use(quo(async () => 'abcd'));
```

The context is passed as the first argument:
```javascript
app.use(quo(async ctx => {
  ctx.status = 418;
  return 'I\'m a teapot
}));
```

Additionally a second function can be supplied to handle error conditions:
```javascript
app.use(
  quo(
    async () => {
      throw new Error('blerg');
    },
    (err, ctx) => {
      if (err.message === 'blerg') {
        ctx.status = 510;
        return 'Not Extended';
      } else {
        throw err;
      }
    }));
```

## Licence
ISC
