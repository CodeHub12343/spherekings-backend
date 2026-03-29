#!/usr/bin/env node
const http = require('http');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWI3YzRlMjliMDM4OTBhYzQ1NDM2N2MiLCJyb2xlIjoiYWRtaW4iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzczOTk4MjUwLCJleHAiOjE3NzQ2MDMwNTB9.wYVV15Jz8JS2sqGJurT5uU9p8aLph2l0m05ZntnQLSE';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/v1/admin/commissions?page=1&limit=10&_nocache=${Date.now()}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Response:', JSON.stringify(jsonData, null, 2));
    } catch(e) {
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

req.end();
