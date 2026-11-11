import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env')
});

const app = express();

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let db;

const allowedCollections = [
  'contacts',
  'projects',
  'qualifications'
];

const ADMIN_EMAIL = 'admin@portfolio.com';
const ADMIN_PASSWORD = 'Admin@12345';

function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ')
    ? header.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({
      error: 'Invalid or expired token'
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      error: 'Admin access required'
    });
  }

  next();
}

function getCollection(req, res) {
  const name = req.params.collection;

  if (!allowedCollections.includes(name)) {
    res.status(404).json({
      error: 'Collection not found'
    });

    return null;
  }

  return db.collection(name);
}

function getEditableData(body) {
  const { _id, created, updated, ...data } = body;
  return data;
}

app.get('/', (req, res) => {
  res.send('Welcome to my Portfolio API');
});

// USER SIGNUP

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = db.collection('users');

    const existingUser = await users.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();

    const result = await users.insertOne({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'User',
      created: now,
      updated: now
    });

    return res.status(201).json({
      message: 'Account created successfully',
      userId: result.insertedId
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    return res.status(500).json({
      error: 'Unable to create account'
    });
  }
});

// USER SIGNIN

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.collection('users').findOne({
      email: normalizedEmail
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role || 'User'
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      message: 'Sign-in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'User'
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Unable to sign in'
    });
  }
});

// SIGNOUT

app.get('/api/auth/signout', authenticateToken, (req, res) => {
  res.json({
    message: 'Sign out successful. Remove the stored token from the browser.'
  });
});

// PUBLIC CONTACT FORM SUBMISSION

app.post('/api/contacts', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      message
    } = req.body;

    if (!firstName || !lastName || !phone || !email || !message) {
      return res.status(400).json({
        error: 'All contact fields are required'
      });
    }

    const now = new Date();

    const result = await db.collection('contacts').insertOne({
      firstName,
      lastName,
      phone,
      email: email.trim().toLowerCase(),
      message,
      created: now,
      updated: now
    });

    return res.status(201).json({
      message: 'Contact message submitted successfully',
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Unable to submit contact message'
    });
  }
});

// PROTECTED API ROUTES

app.use('/api', authenticateToken);

// CURRENT USER

app.get('/api/auth/me', (req, res) => {
  res.json({
    userId: req.user.userId,
    email: req.user.email,
    role: req.user.role
  });
});

// READ ALL RECORDS

app.get('/api/:collection', async (req, res) => {
  try {
    const collection = getCollection(req, res);

    if (!collection) return;

    const results = await collection.find({}).toArray();

    return res.json(results);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Unable to retrieve records'
    });
  }
});

// CREATE RECORD - ADMIN ONLY

app.post('/api/:collection', requireAdmin, async (req, res) => {
  try {
    const collection = getCollection(req, res);

    if (!collection) return;

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        error: 'Invalid record data'
      });
    }

    const data = getEditableData(req.body);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: 'Record data is required'
      });
    }

    const now = new Date();

    const result = await collection.insertOne({
      ...data,
      created: now,
      updated: now
    });

    return res.status(201).json({
      message: 'Record created successfully',
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Unable to create record'
    });
  }
});

// READ ONE RECORD

app.get('/api/:collection/:id', async (req, res) => {
  try {
    const collection = getCollection(req, res);

    if (!collection) return;

    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID'
      });
    }

    const result = await collection.findOne({
      _id: new ObjectId(id)
    });

    if (!result) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Unable to retrieve record'
    });
  }
});

// UPDATE RECORD - ADMIN ONLY

app.put('/api/:collection/:id', requireAdmin, async (req, res) => {
  try {
    const collection = getCollection(req, res);

    if (!collection) return;

    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID'
      });
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        error: 'Invalid record data'
      });
    }

    const data = getEditableData(req.body);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: 'Updated data is required'
      });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updated: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    return res.json({
      message: 'Record updated successfully'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Unable to update record'
    });
  }
});

// DELETE RECORD - ADMIN ONLY

app.delete('/api/:collection/:id', requireAdmin, async (req, res) => {
  try {
    const collection = getCollection(req, res);

    if (!collection) return;

    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID'
      });
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    return res.json({
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Unable to delete record'
    });
  }
});

// START SERVER

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from .env');
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from .env');
  }

  await client.connect();

  db = client.db('Portfolio');

  console.log('Connected to MongoDB');

  const users = db.collection('users');

  await users.createIndex(
    { email: 1 },
    { unique: true }
  );

  // CREATE DEFAULT ADMIN ACCOUNT

  const existingAdmin = await users.findOne({
    email: ADMIN_EMAIL
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const now = new Date();

    await users.insertOne({
      name: 'Portfolio Administrator',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'Admin',
      created: now,
      updated: now
    });

    console.log('Default Admin account created');
  } else if (existingAdmin.role !== 'Admin') {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await users.updateOne(
      { _id: existingAdmin._id },
      {
        $set: {
          name: 'Portfolio Administrator',
          password: hashedPassword,
          role: 'Admin',
          updated: new Date()
        }
      }
    );

    console.log('Default Admin account updated');
  }

  app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
});