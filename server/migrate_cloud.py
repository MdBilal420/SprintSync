#!/usr/bin/env python3
"""
Run Alembic migrations with Cloud SQL environment
"""
import os
import subprocess
import sys

# Load cloud development environment
with open('.env.cloud-dev', 'r') as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            os.environ[key] = value

# Run alembic upgrade
result = subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"])
sys.exit(result.returncode)