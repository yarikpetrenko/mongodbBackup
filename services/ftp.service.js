const ftp = require("ftp");
const fs = require("fs");
const {
  getFilesFromList,
  sortFilesByName,
  ftpErrorHandler,
} = require("../helpers/ftp.helper");
const { getBackupPath } = require("../helpers/mongodb.helper");

// Get all files inside active dir
const getFileList = (client) => {
  return new Promise((resolve, reject) => {
    client.list((err, list) => {
      if (err) reject(err);
      resolve(list);
    });
  });
};

// Free up the space on selected amount
const freeSpace = async (client, size) => {
  const files = await getFileList(client);

  // Usually empty folder has few folders or so. We need to filter these folders and sort files by name
  const arr = sortFilesByName(getFilesFromList(files));

  let deleteSize = 0;
  const deleteArr = [];

  while (deleteSize < size && arr.length > 0) {
    const file = arr.shift();
    deleteSize += file.size;
    deleteArr.push(file);
  }

  // If the array is empty, but we still need more free space, throw an error
  if (deleteSize < size) {
    throw new Error("There is not enough free space to save the backup");
  }

  // Delete files
  deleteArr.forEach((el) => client.delete(el.name, ftpErrorHandler));
};

// Get the total file size of a folder
const getFolderTotalSize = async (client) => {
  const files = await getFileList(client);

  // Usually empty folder has few folders or so. We need to filter these folders
  const arr = getFilesFromList(files);

  return arr.map((el) => el.size).reduce((a, b) => a + b, 0);
};

const saveMongoBackupService = async () => {
  return new Promise((resolve, reject) => {
    const client = new ftp();

    client.on("ready", async () => {
      try {
        // Get backup path
        const backupPath = getBackupPath();

        // If backup does not exist return
        if (!fs.existsSync(backupPath))
          throw new Error("BackUp does not exist");

        // Get all files in current (root) folder
        const files = await getFileList(client);

        // Find operation folder
        const folder = files.find(
          (el) => el.type === "d" && el.name === process.env.FTP_DIR
        );

        // If operation folder does not exist then create a new one
        if (folder === undefined) {
          client.mkdir(process.env.FTP_DIR, ftpErrorHandler);
        }

        // Navigate to operation folder
        client.cwd(process.env.FTP_DIR, ftpErrorHandler);

        // Get backup file size and store into backupSize const
        const { size: backupSize } = await fs.promises.stat(backupPath);
        // Declare operation folder size const
        const folderSize =
          folder !== undefined ? await getFolderTotalSize(client) : 0;

        // If we don't have enough space to add new backup than free up required space
        if (folderSize + backupSize > +process.env.FTP_MAX_SIZE) {
          await freeSpace(
            client,
            folderSize + backupSize - +process.env.FTP_MAX_SIZE
          );
        }

        // Upload backup file
        client.put(
          backupPath,
          `${Date.now()}_${process.env.DB_NAME}.gzip`,
          (err) =>
            ftpErrorHandler(err, () => {
              client.end();
              resolve();
            })
        );
      } catch (e) {
        client.end();
        reject(e);
      }
    });

    client.connect({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PWD,
    });
  });
};

module.exports = { saveMongoBackupService };
