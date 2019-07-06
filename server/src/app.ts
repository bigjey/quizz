import express from 'express';
import path from 'path';

export const app = express();

app.use('/', express.static(path.resolve(__dirname, '../../client/dist')));

app.use('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../client/dist/index.html'));
});
