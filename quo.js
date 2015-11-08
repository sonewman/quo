module.exports = Quo;

function createHandle(ctx) {
  return function handle(b) {
    if (b !== undefined && ctx.body === undefined)
      ctx.body = b;
  };
}

function exec(ctx, fn) {
  return Promise.resolve(fn.call(ctx, ctx)).then(createHandle(ctx));
}

function wrapErr(ctx, fn, onErr) {
  return exec(ctx, fn).catch(function (err) {
    return Promise.resolve(onErr.call(ctx, err, ctx))
      .then(createHandle(ctx));
  });
}

function Quo(fn, onErr) {
  if ('function' !== typeof fn)
    throw new TypeError(`${fn} must be Function`);

  return function* quo() {
    yield 'function' === typeof onErr
      ? wrapErr(this, fn, onErr)
      : exec(this, fn);
  };
}
