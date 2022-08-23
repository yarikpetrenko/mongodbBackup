require("dotenv").config();
const { saveMongoBackupService } = require("./services/ftp.service");
const { backupMongoDBService } = require("./services/mongodb.service");

backupMongoDBService();
saveMongoBackupService();
