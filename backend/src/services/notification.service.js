const nodemailer = require('nodemailer');
const { supabaseAdmin } = require('../config/supabaseClient');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Save notification to DB
 */
const saveNotification = async (userId, message, type) => {
  const { error } = await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    message,
    type,
  });
  if (error) console.error('Failed to save notification:', error.message);
};

/**
 * Send email notification
 */
const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL SKIPPED - no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'LostLink <noreply@lostlink.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

/**
 * Notify when a match is found
 */
const notifyMatchFound = async (user, lostItem, foundItem) => {
  const message = `A potential match was found for your lost item "${lostItem.title}"!`;
  await saveNotification(user.id, message, 'match_found');
  await sendEmail(
    user.email,
    '🎉 LostLink: Potential Match Found!',
    `
    <h2>Good news, ${user.name}!</h2>
    <p>We found a potential match for your lost item: <strong>${lostItem.title}</strong></p>
    <p>Matching found item: <strong>${foundItem.title}</strong> at <em>${foundItem.location}</em></p>
    <a href="${process.env.FRONTEND_URL}/items/${foundItem.id}" style="background:#4F46E5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
      View Match
    </a>
    `
  );
};

/**
 * Notify when a claim request is made
 */
const notifyClaimRequest = async (itemOwner, claimant, item) => {
  const message = `${claimant.name} has submitted a claim for your item "${item.title}"`;
  await saveNotification(itemOwner.id, message, 'claim_request');
  await sendEmail(
    itemOwner.email,
    '📬 LostLink: New Claim Request',
    `
    <h2>New Claim Request</h2>
    <p><strong>${claimant.name}</strong> has submitted a claim for your item: <strong>${item.title}</strong></p>
    <a href="${process.env.FRONTEND_URL}/claims" style="background:#4F46E5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
      Review Claim
    </a>
    `
  );
};

/**
 * Notify when claim is accepted
 */
const notifyClaimAccepted = async (claimant, item) => {
  const message = `Your claim for "${item.title}" has been accepted! Contact the owner to arrange pickup.`;
  await saveNotification(claimant.id, message, 'claim_accepted');
  await sendEmail(
    claimant.email,
    '✅ LostLink: Claim Accepted!',
    `
    <h2>Your Claim Was Accepted!</h2>
    <p>Great news! Your claim for <strong>${item.title}</strong> has been accepted.</p>
    <p>Please contact the item owner to arrange the return.</p>
    <a href="${process.env.FRONTEND_URL}/items/${item.id}" style="background:#16a34a;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
      View Item
    </a>
    `
  );
};

/**
 * Notify when claim is rejected
 */
const notifyClaimRejected = async (claimant, item) => {
  const message = `Your claim for "${item.title}" was not accepted.`;
  await saveNotification(claimant.id, message, 'claim_rejected');
  await sendEmail(
    claimant.email,
    '❌ LostLink: Claim Update',
    `
    <h2>Claim Not Accepted</h2>
    <p>Unfortunately, your claim for <strong>${item.title}</strong> was not accepted by the owner.</p>
    <p>You can continue browsing other found items.</p>
    <a href="${process.env.FRONTEND_URL}/items" style="background:#4F46E5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
      Browse Items
    </a>
    `
  );
};

module.exports = {
  notifyMatchFound,
  notifyClaimRequest,
  notifyClaimAccepted,
  notifyClaimRejected,
  saveNotification,
};
