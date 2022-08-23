const ftpErrorHandler = (err, cb = null) => {
  if (err) throw err;
  if (typeof cb === "function") cb();
};

// Filters everything except files
const getFilesFromList = (files) => {
  return files.filter((file) => file?.type === "-");
};

// Sort arr by property: name
const sortFilesByName = (files) => {
  return files.sort((a, b) => {
    const attrA = a.name.toLowerCase();
    const attrB = b.name.toLowerCase();
    if (attrA < attrB) {
      return -1;
    }
    if (attrA > attrB) {
      return 1;
    }
    return 0;
  });
};

module.exports = { ftpErrorHandler, getFilesFromList, sortFilesByName };
