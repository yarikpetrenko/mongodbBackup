const { spawn } = require("child_process");
const path = require("path");

const clearChildListeners = (child) => {
  try {
    child.removeAllListeners("error");
    child.removeAllListeners("exit");
  } catch (e) {
    console.log(e);
  }
};

const backupMongoDBService = () => {
  // Get backup path
  const backupPath = path.resolve(
    __dirname,
    "../public",
    `${process.env.DB_NAME}.gzip`
  );

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
    throw e;
  });

  // Exit handler
  child.once("exit", (code, signal) => {
    clearChildListeners(child);
    if (code) {
      throw new Error("Process exit with code:", code);
    } else if (signal) {
      throw new Error("Process killed with signal:", signal);
    }
  });
};

module.exports = { backupMongoDBService };
