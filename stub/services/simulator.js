const OUTCOMES = {
  whatsapp: { delivered: 0.92, failed: 0.08 },
  sms: { delivered: 0.85, failed: 0.15 },
  email: { delivered: 0.78, failed: 0.22 },
  rcs: { delivered: 0.8, failed: 0.2 },
};

const ENGAGEMENT = {
  whatsapp: { opened: 0.65, clicked: 0.18 },
  sms: { opened: 0.45, clicked: 0.12 },
  email: { opened: 0.28, clicked: 0.08 },
  rcs: { opened: 0.55, clicked: 0.22 },
};

const CRM_URL = process.env.CRM_CALLBACK_URL || 'http://localhost:3000';
const MAX_RETRIES = 5;

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendCallback(stubMsgId, event, attempt = 0) {
  const timestamp = new Date().toISOString();

  try {
    const res = await fetch(`${CRM_URL}/crm/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stubMsgId, event, timestamp }),
    });

    if (!res.ok && res.status >= 500 && attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt) * 1000;
      console.log(
        `Retry ${attempt + 1}/${MAX_RETRIES} for ${stubMsgId} event=${event} in ${delay}ms`
      );
      await sleep(delay);
      return sendCallback(stubMsgId, event, attempt + 1);
    }

    if (!res.ok) {
      console.error(`Callback failed for ${stubMsgId}: ${res.status}`);
    }
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const delay = Math.pow(2, attempt) * 1000;
      console.log(
        `Retry ${attempt + 1}/${MAX_RETRIES} for ${stubMsgId} event=${event} (error) in ${delay}ms`
      );
      await sleep(delay);
      return sendCallback(stubMsgId, event, attempt + 1);
    }
    console.error(`Callback dropped for ${stubMsgId}:`, err.message);
  }
}

export function simulateMessage({ stubMsgId, channel }) {
  const outcomes = OUTCOMES[channel] || OUTCOMES.whatsapp;
  const engagement = ENGAGEMENT[channel] || ENGAGEMENT.whatsapp;

  setTimeout(async () => {
    const delivered = Math.random() < outcomes.delivered;
    const event = delivered ? 'delivered' : 'failed';
    await sendCallback(stubMsgId, event);

    if (!delivered) return;

    setTimeout(async () => {
      if (Math.random() < engagement.opened) {
        await sendCallback(stubMsgId, 'opened');

        setTimeout(async () => {
          if (Math.random() < engagement.clicked) {
            await sendCallback(stubMsgId, 'clicked');
          }
        }, randomBetween(1000, 8000));
      }
    }, randomBetween(2000, 15000));
  }, randomBetween(1000, 4000));
}
