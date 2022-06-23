const allowed = [
  'http://your-movies.nomoreparties.sbs',
  'https://your-movies.nomoreparties.sbs',
  'http://localhost:3000',
];

const cors = (req, res, next) => {
  const { origin } = req.headers;
  const { method } = req;
  if (allowed.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', true);
  }
  const headers = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    );
    res.header('Access-Control-Allow-Headers', headers);
    return res.end();
  }

  return next();
};

module.exports = cors;
