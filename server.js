import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const app = express();
const PORT = 3000;

// API key to secure access
const API_KEY = 'gmail-api-' + Math.random().toString(36).substring(2, 15);

const CREDENTIALS_PATH = path.join(os.homedir(), '.gmail-mcp', 'gcp-oauth.keys.json');
const TOKEN_PATH = path.join(os.homedir(), '.gmail-mcp', 'credentials.json');

let gmail = null;
let oauth2Client = null;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  next();
};

// Gmail initialization
async function initializeGmail() {
  if (gmail) return;

  try {
    const credentialsContent = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
    const credentials = JSON.parse(credentialsContent);

    const { client_id, client_secret, redirect_uris } = credentials.web || credentials.installed;

    oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    const tokenContent = await fs.readFile(TOKEN_PATH, 'utf-8');
    const token = JSON.parse(tokenContent);

    oauth2Client.setCredentials(token);
    gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    console.log('✅ Gmail API initialized');
  } catch (error) {
    console.error('❌ Gmail initialization error:', error);
    throw error;
  }
}

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Gmail API Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/labels/list',
      'POST /api/labels/create',
      'POST /api/messages/search',
      'POST /api/messages/get',
      'POST /api/messages/send',
      'POST /api/messages/delete',
      'POST /api/messages/batch-delete',
      'POST /api/messages/batch-trash',
      'POST /api/messages/add-label',
      'POST /api/messages/remove-label',
      'POST /api/messages/delete-by-query',
    ],
  });
});

// List labels
app.post('/api/labels/list', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const response = await gmail.users.labels.list({ userId: 'me' });
    res.json({ labels: response.data.labels });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a label
app.post('/api/labels/create', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { name, labelListVisibility = 'labelShow', messageListVisibility = 'show' } = req.body;

    const response = await gmail.users.labels.create({
      userId: 'me',
      requestBody: { name, labelListVisibility, messageListVisibility },
    });

    res.json({ label: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search messages
app.post('/api/messages/search', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { query, maxResults = 100 } = req.body;

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    res.json({ messages: response.data.messages || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a message
app.post('/api/messages/get', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { messageId } = req.body;

    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    res.json({ message: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a message
app.post('/api/messages/delete', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { messageId } = req.body;

    await gmail.users.messages.delete({
      userId: 'me',
      id: messageId,
    });

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete multiple messages (optimized with Gmail API batchDelete)
app.post('/api/messages/batch-delete', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { messageIds } = req.body;

    const BATCH_SIZE = 100; // Gmail API supports up to 1000, but 100 is safer

    let deletedCount = 0;
    let failedCount = 0;

    // Process in batches
    for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
      const batch = messageIds.slice(i, i + BATCH_SIZE);

      try {
        await gmail.users.messages.batchDelete({
          userId: 'me',
          requestBody: { ids: batch }
        });
        deletedCount += batch.length;
      } catch (error) {
        failedCount += batch.length;
        console.error(`Failed to delete batch:`, error.message);
      }
    }

    res.json({
      success: true,
      deletedCount,
      failedCount,
      total: messageIds.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move multiple messages to trash
app.post('/api/messages/batch-trash', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { messageIds } = req.body;

    let trashedCount = 0;
    let failedCount = 0;

    for (const messageId of messageIds) {
      try {
        await gmail.users.messages.trash({
          userId: 'me',
          id: messageId,
        });
        trashedCount++;
      } catch (error) {
        failedCount++;
        console.error(`Failed to trash ${messageId}:`, error.message);
      }
    }

    res.json({
      success: true,
      trashedCount,
      failedCount,
      total: messageIds.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a label to a message
app.post('/api/messages/add-label', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { messageId, labelId } = req.body;

    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: { addLabelIds: [labelId] },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a label from a message
app.post('/api/messages/remove-label', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { messageId, labelId } = req.body;

    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: { removeLabelIds: [labelId] },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send an email
app.post('/api/messages/send', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { to, subject, body, cc, bcc } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    // Build email headers
    let email = [
      `To: ${to}`,
      `Subject: ${subject}`,
    ];

    if (cc) email.push(`Cc: ${cc}`);
    if (bcc) email.push(`Bcc: ${bcc}`);

    email.push('Content-Type: text/plain; charset=utf-8');
    email.push('');
    email.push(body);

    const rawMessage = email.join('\r\n');

    // Encode in base64url format
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    res.json({ success: true, messageId: response.data.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all messages matching a query (optimized)
app.post('/api/messages/delete-by-query', authenticate, async (req, res) => {
  try {
    await initializeGmail();
    const { query } = req.body;

    let totalDeleted = 0;
    const BATCH_SIZE = 100;

    while (true) {
      // Search for messages
      const searchResponse = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 500
      });

      const messages = searchResponse.data.messages || [];

      if (messages.length === 0) {
        break;
      }

      const messageIds = messages.map(m => m.id);

      // Delete in batches
      for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
        const batch = messageIds.slice(i, i + BATCH_SIZE);

        try {
          await gmail.users.messages.batchDelete({
            userId: 'me',
            requestBody: { ids: batch }
          });
          totalDeleted += batch.length;
        } catch (error) {
          console.error(`Failed to delete batch:`, error.message);
        }
      }
    }

    res.json({
      success: true,
      deletedCount: totalDeleted,
      query
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server startup
app.listen(PORT, async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Gmail API Server started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${API_KEY}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('💡 To expose via ngrok:');
  console.log(`   ngrok http ${PORT}`);
  console.log('');
  console.log('📝 Keep this API key secret!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
