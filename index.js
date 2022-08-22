const { backupMongoDBService } = require("./services/mongodb.service");

require("dotenv").config();

backupMongoDBService();
