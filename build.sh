#!/bin/bash

r.js -o build/config.js

cat src/header.js zig.min.js > /tmp/out && mv /tmp/out zig.min.js
