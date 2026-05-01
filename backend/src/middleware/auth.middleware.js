const { supabaseAdmin } = require('../config/supabaseClient');

/**
 * Verifies the Supabase JWT from Authorization header.
 * Attaches req.user = { id, email, role } on success.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user record from public.users for role info
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    req.user = profile;
    req.token = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = { authenticate };
