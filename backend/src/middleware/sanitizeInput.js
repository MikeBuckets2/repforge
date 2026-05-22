import xss from 'xss';

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xss(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, sanitizeValue(nested)]));
  }

  return value;
};

export const sanitizeInput = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);

  for (const key of Object.keys(req.query || {})) {
    req.query[key] = sanitizeValue(req.query[key]);
  }

  for (const key of Object.keys(req.params || {})) {
    req.params[key] = sanitizeValue(req.params[key]);
  }

  next();
};
