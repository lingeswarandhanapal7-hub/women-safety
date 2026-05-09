const twilio = require('twilio');

let client = null;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && !process.env.TWILIO_ACCOUNT_SID.includes('xxx')) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio service initialized');
  } else {
    console.warn('⚠️ Twilio credentials missing or placeholder. SMS/Voice alerts will be disabled.');
  }
} catch (err) {
  console.error('❌ Failed to initialize Twilio:', err.message);
}

const sendSMS = async (to, body) => {
  if (!client) {
    console.log('📱 [DEMO SMS] To:', to, 'Body:', body);
    return { sid: 'demo_sid_' + Date.now() };
  }
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
};

const makeCall = async (to, url) => {
  if (!client) {
    console.log('📞 [DEMO CALL] To:', to, 'URL:', url);
    return { sid: 'demo_call_sid_' + Date.now() };
  }
  return client.calls.create({
    url,
    to,
    from: process.env.TWILIO_PHONE_NUMBER
  });
};

module.exports = { sendSMS, makeCall };
