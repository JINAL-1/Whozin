require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Could not start server:', err.message);
    process.exit(1);
  }
  console.log(`Whozin API running on http://localhost:${PORT}`);
});