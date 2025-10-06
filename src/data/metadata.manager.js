const fs = require('fs').promises;
const path = require('path');

const writeMetadata = async (directory, metadata) => {
  const xmlContent = `<upload_info><original_filename>${metadata.original_filename}</original_filename></upload_info>`;
  await fs.writeFile(path.join(directory, 'info.xml'), xmlContent);
};

const readMetadata = async (directory) => {
  const xmlContent = await fs.readFile(path.join(directory, 'info.xml'), 'utf-8');
  const match = xmlContent.match(/<original_filename>(.*?)<\/original_filename>/);
  return { original_filename: match ? match[1] : 'file' };
};

module.exports = { writeMetadata, readMetadata };
