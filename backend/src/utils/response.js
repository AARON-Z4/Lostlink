/**
 * Standard API response helpers.
 */

const success = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, ...data });
};

const created = (res, data = {}) => success(res, data, 201);

const error = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, error: message });
};

const paginated = (res, items, total, page, limit) => {
  return res.json({
    success: true,
    items,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = { success, created, error, paginated };
