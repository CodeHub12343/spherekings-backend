#!/usr/bin/env node
/**
 * Force Kill & Restart Script
 * Kills all Node processes and cleanly restarts the backend
 */

const { exec } = require('child_process');
const { spawn } = require('child_process');

console.log('🔪 Killing all Node processes...\n');

// Kill all node processes on this machine
exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
  if (stderr && !stderr.includes('No tasks')) {
    console.log('Killed processes:', stderr);
  }

  console.log('\n✅ All Node processes killed\n');
  console.log('⏳ Waiting 3 seconds...\n');

  setTimeout(() => {
    console.log('🚀 Starting backend server...\n');

    // Start npm run dev in this terminal
    const server = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    server.on('error', (err) => {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    });

    server.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
      process.exit(code);
    });

  }, 3000);
});
