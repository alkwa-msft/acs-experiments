import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.get('/token', (req, res) => {

});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
