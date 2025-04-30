#!/bin/bash

# Start the server and wait for it to be ready
cross-env NODE_ENV=development tsx server/index.ts &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
while ! curl -s http://localhost:5000 > /dev/null; do
  sleep 1
done

# Start Electron
echo "Starting Electron..."
electron electron.js

# When Electron exits, kill the server
kill $SERVER_PID