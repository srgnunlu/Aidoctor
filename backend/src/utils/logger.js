const logger = {
  info: (message, meta = {}) => {
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    console.log(`[INFO] ${new Date().toISOString()} - ${message} ${metaStr}`);
  },
  error: (message, meta = {}) => {
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    console.error(`[ERROR] ${new Date().toISOString()} - ${message} ${metaStr}`);
  },
  warn: (message, meta = {}) => {
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    console.warn(`[WARN] ${new Date().toISOString()} - ${message} ${metaStr}`);
  }
};

module.exports = logger;
