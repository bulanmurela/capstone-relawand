import os
import re

files_to_fix = [
    'client/src/components/GrafikGas.tsx',
    'client/src/components/GrafikTempHum.tsx',
    'client/src/components/MapComponent.tsx',
    'client/src/app/grafik-pemantauan/page.tsx'
]

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    # Replace URLs in template literals
    content = re.sub(r"`http://localhost:5000", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}", content)
    # Replace URLs in quotes  
    content = re.sub(r'"http://localhost:5000', 'process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
        return True
    return False

count = 0
for file in files_to_fix:
    if os.path.exists(file):
        if fix_file(file):
            count += 1
            
print(f"\nTotal files updated: {count}")
