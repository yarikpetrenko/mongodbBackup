require("dotenv").config();
const cron = require("node-cron");
const { saveMongoBackupService } = require("./services/ftp.service");
const { backupMongoDBService } = require("./services/mongodb.service");

cron.schedule("* * * * *", async () => {
  try {
    await backupMongoDBService();
    await saveMongoBackupService();
    console.log(`${new Date().toUTCString()} Backup successful`);
  } catch (e) {
    console.log(`${new Date().toUTCString()} ${e}`);
  }
});
