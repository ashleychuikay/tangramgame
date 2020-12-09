import json
from pathlib import Path
import numpy as np

folder = Path('.').rglob('*.jpg')
filenames = ['images/' + x.name for x in folder]
with open('imgs.js', 'w') as js_file:
    js_file.write('const all_tangrams = ')
    json.dump([{'target': f} for f in filenames], js_file)
