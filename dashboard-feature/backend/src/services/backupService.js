const { spawn } = require('child_process');
const path = require('path');

// Basic PG Dump streamer
const createBackupStream = () => {
  const dbUrl = process.env.TRANSFERS_DATABASE_URL;
  if (!dbUrl) {
    throw new Error('Database URL not configured');
  }

  // pg_dump is required in the environment
  const pgDump = spawn('pg_dump', [dbUrl, '--data-only', '--table=settings', '--table=transfer_events']);

  return {
    stream: pgDump.stdout,
    error: pgDump.stderr
  };
};

module.exports = {
  createBackupStream
};
