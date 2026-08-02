const { Webhook } = require('svix');
const User = require('../models/User');

const clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET in environment variables');
    return res.status(500).json({ error: 'Missing webhook secret' });
  }

  // Get headers
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Error occurred -- no svix headers' });
  }

  // Get body
  // Since we use express.raw({type: 'application/json'}) for this route, req.body is a Buffer
  const payload = req.body.toString('utf8');
  const body = payload;

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify payload
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({ error: 'Error occurred' });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { email_addresses, first_name, last_name, image_url } = evt.data;
    
    // Get primary email
    const primaryEmail = email_addresses.length > 0 ? email_addresses[0].email_address : '';

    try {
      await User.findOneAndUpdate(
        { clerkUserId: id },
        {
          clerkUserId: id,
          email: primaryEmail,
          firstName: first_name || '',
          lastName: last_name || '',
          imageUrl: image_url || ''
        },
        { upsert: true, new: true }
      );
      console.log(`User ${id} was ${eventType === 'user.created' ? 'created' : 'updated'} in MongoDB`);
    } catch (err) {
      console.error('Error saving user to database:', err);
      return res.status(500).json({ error: 'Error saving user to database' });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await User.findOneAndDelete({ clerkUserId: id });
      console.log(`User ${id} was deleted from MongoDB`);
    } catch (err) {
      console.error('Error deleting user from database:', err);
      return res.status(500).json({ error: 'Error deleting user from database' });
    }
  }

  return res.status(200).json({ success: true, message: 'Webhook received' });
};

module.exports = {
  clerkWebhook
};
