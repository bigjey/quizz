import express from 'express';
import path from 'path';

export const app = express();

app.use('/', express.static(path.resolve(__dirname, '../client')));

app.use('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/index.html'));
});
