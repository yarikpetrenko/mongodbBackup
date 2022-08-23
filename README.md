# MongoDB Auto Backup

**.env**

- DB_NAME=_The name of the database to back up_
- DB_HOST=_Database host (localhost, 198.51.100.1, etc.)_
- DB_USER=_Database authorization user_
- DB_PWD=_Database authorization password_
- DB_AUTH=_Authorization database by default admin_
- DB_FLAGS=**--gzip** _Flags for backup generation.
Because we need to authorize in case to get backup you need specify auth flags here if needed (--ssl, etc.).
Here you need to add **--gzip** for correct work. All flags must be separated by a single space. **Example:** **DB_FLAGS=--ssl --gzip --quiet**. For more info: [docs](https://www.mongodb.com/docs/database-tools/mongodump/#options)_
- FTP_HOST=_FTP host_
- FTP_USER=_FTP user_
- FTP_PWD=_FTP password_
- FTP_DIR=_The name of the directory where you want to store the backups. If the folder does not exist, it will be created automatically_
- FTP_MAX_SIZE=_FTP does not provide information about free disk space, so you need to specify the maximum space in **bytes** for all backups. You can specify a lower number than that and run multiple scripts for different databases. **Example:** **FTP_MAX_SIZE=9663676416** for 9GB_

**NOTES**

- By default it uses port 21 for FTP connection, if you want to make SFTP or so, you need to specify it inside **ftp.service.js** - 
    `client.connect({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PWD,
      port: // Your port,
    });`
    [docs](https://www.npmjs.com/package/ftp#methods)
- The script runs every day at midnight. You can change it in **index.js** - `cron.schedule("* * * * *")`. Here you can specify the time in cron format. [package docs](https://www.npmjs.com/package/node-cron), [cron generator](https://crontab.guru/)
