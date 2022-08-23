const path = require("path");

// Resolve path to backup file
const getBackupPath = () => {
  return path.resolve(__dirname, "../public", `${process.env.DB_NAME}.gzip`);
};

module.exports = { getBackupPath };
