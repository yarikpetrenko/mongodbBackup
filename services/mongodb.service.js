const { spawn } = require("child_process");
const path = require("path");

const clearChildListeners = (child) => {
  try {
    child.removeAllListeners("error");
    child.stderr.removeAllListeners("data");
    child.stdout.removeAllListeners("data");
  } catch (e) {
    console.log(e);
  }
};

const backupMongoDBService = () => {
  const backupPath = path.resolve(
    __dirname,
    "../public",
    `${process.env.DB_NAME}.gzip`
  );

  const child = spawn("mongodump", [
    ...process.env.DB_FLAGS.split(" "),
    `--host=${process.env.DB_HOST}`,
    `-u=${process.env.DB_USER}`,
    `-p=${process.env.DB_PWD}`,
    `--authenticationDatabase=${process.env.DB_AUTH}`,
    `--db=${process.env.DB_NAME}`,
    `--archive=${backupPath}`,
  ]);

  child.stdout.on("data", (data) => {
    console.log(data?.toString());
  });

  child.stderr.on("data", (e) => {
    console.log(e?.toString());
  });

  child.once("error", (e) => {
    clearChildListeners(child);
    console.log(e);
  });

  child.once("exit", (code, signal) => {
    clearChildListeners(child);
    if (code) {
      console.log("Process exit with code:", code);
    } else if (signal) {
      console.log("Process killed with signal:", signal);
    } else {
      console.log("Backup is successful");
    }
  });
};

module.exports = { backupMongoDBService };
