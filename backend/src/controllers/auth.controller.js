const { supabase, supabaseAdmin } = require('../config/supabaseClient');

/**
 * POST /auth/register
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Create Supabase Auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm for dev; remove in prod to require email verification
    user_metadata: { name },
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // Insert into public.users
  const { error: profileError } = await supabaseAdmin.from('users').insert({
    id: authData.user.id,
    name,
    email,
    role: 'user',
  });

  if (profileError) {
    // Rollback auth user
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return res.status(500).json({ error: 'Failed to create user profile' });
  }

  // Sign in to get JWT token
  const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return res.status(201).json({ message: 'Registered. Please log in.' });
  }

  return res.status(201).json({
    message: 'Registration successful',
    user: { id: authData.user.id, name, email, role: 'user' },
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
  });
};

/**
 * POST /auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Fetch user profile
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return res.json({
    message: 'Login successful',
    user: profile,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
};

/**
 * POST /auth/logout
 */
const logout = async (req, res) => {
  await supabase.auth.signOut();
  return res.json({ message: 'Logged out successfully' });
};

/**
 * GET /auth/me
 */
const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

/**
 * POST /auth/refresh
 */
const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Refresh token required' });

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });
  if (error) return res.status(401).json({ error: 'Invalid refresh token' });

  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
};

module.exports = { register, login, logout, getMe, refreshToken };
