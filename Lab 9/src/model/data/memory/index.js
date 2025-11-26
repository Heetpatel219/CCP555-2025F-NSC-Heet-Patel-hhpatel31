const MemoryDB = require('./memory-db');
const db = new MemoryDB();

// Export functions for routes/tests
module.exports = {
  writeFragment: db.writeFragment.bind(db),
  readFragment: db.readFragment.bind(db),
  writeFragmentData: db.writeFragmentData.bind(db),
  readFragmentData: db.readFragmentData.bind(db),
  listFragments: db.listFragments.bind(db),
  deleteFragment: db.deleteFragment.bind(db),
  db, // exporting db instance for direct access in fragment.js list()
};
