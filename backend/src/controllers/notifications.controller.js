const { supabaseAdmin } = require('../config/supabaseClient');

/**
 * GET /notifications  — get current user's notifications
 */
const getNotifications = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });

  const unreadCount = data.filter((n) => !n.is_read).length;
  return res.json({ notifications: data, unread_count: unreadCount });
};

/**
 * PATCH /notifications/:id/read  — mark a notification as read
 */
const markAsRead = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Notification marked as read' });
};

/**
 * PATCH /notifications/read-all  — mark all as read
 */
const markAllAsRead = async (req, res) => {
  const { error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', req.user.id)
    .eq('is_read', false);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'All notifications marked as read' });
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
