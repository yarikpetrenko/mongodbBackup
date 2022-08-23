const { spawn } = require("child_process");
const { getBackupPath } = require("../helpers/mongodb.helper");

const clearChildListeners = (child) => {
  try {
    child.removeAllListeners("error");
    child.removeAllListeners("exit");
  } catch (e) {
    console.log(e);
  }
};

const backupMongoDBService = () => {
  return new Promise((resolve, reject) => {
    // Get backup path
    const backupPath = getBackupPath();

    // Run backup command
    const child = spawn("mongodump", [
      ...process.env.DB_FLAGS.split(" "),
      `--host=${process.env.DB_HOST}`,
      `-u=${process.env.DB_USER}`,
      `-p=${process.env.DB_PWD}`,
      `--authenticationDatabase=${process.env.DB_AUTH}`,
      `--db=${process.env.DB_NAME}`,
      `--archive=${backupPath}`,
    ]);

    // Error handler
    child.once("error", (e) => {
      clearChildListeners(child);
      reject(e);
    });

    // Exit handler
    child.once("exit", (code, signal) => {
      clearChildListeners(child);
      if (code) {
        reject("Process exit with code:", code);
      } else if (signal) {
        reject("Process killed with signal:", signal);
      } else {
        resolve();
      }
    });
  });
};

module.exports = { backupMongoDBService };
