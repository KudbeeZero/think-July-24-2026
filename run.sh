#!/bin/bash
pip3 install -r services/grok-api/requirements.txt --break-system-packages
node dist/server.cjs
