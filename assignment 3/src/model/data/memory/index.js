const MemoryDB = require('./memory-db');
const db = new MemoryDB();

// Export functions for routes/tests that match AWS interface
module.exports = {
  writeFragment: (fragment) => db.writeFragment(fragment),
  readFragment: (ownerId, id) => db.readFragment(ownerId, id),
  writeFragmentData: (ownerId, id, data) => db.writeFragmentData(ownerId, id, data),
  readFragmentData: (ownerId, id) => db.readFragmentData(ownerId, id),
  listFragments: (ownerId, expand) => db.listFragments(ownerId, expand),
  deleteFragment: (ownerId, id) => db.deleteFragment(ownerId, id),
  db, // exporting db instance for direct access in tests
};
