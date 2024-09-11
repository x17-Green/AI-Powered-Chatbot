import express from 'express';

const router = express.Router();

router.get('/chat', (req, res) => {
  res.json({ message: 'Chat endpoint' });
});

router.get('/movie', (req, res) => {
  res.json({ message: 'Movie endpoint' });
});

export default router;