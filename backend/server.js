require('dotenv').config({ override: false });
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

// For Vercel, export the Express app
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  });
}
