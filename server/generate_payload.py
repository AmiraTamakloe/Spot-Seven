#!/usr/bin/env python3

import base64
import json
import sys

if (len(sys.argv) < 3):
    print("Usage: ./generate_payload.py <file1> <file2> [radius]")
    exit(-1)

with open(sys.argv[1], 'rb') as f:
    file1_data = base64.b64encode(f.read()).decode()

with open(sys.argv[2], 'rb') as f:
    file2_data = base64.b64encode(f.read()).decode()

detectionRadius = 0
if len(sys.argv) > 3: detectionRadius = int(sys.argv[3])

dict = {
    "detectionRadius": detectionRadius,
    "leftImage": file1_data,
    "rightImage": file2_data
}

with open("payload.json", "w") as f:
    json.dump(dict, f)
