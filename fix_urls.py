import os
import re

def fix_urls_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    # Replace all instances
    content = re.sub(r"'http://localhost:5000", "process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000", content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
        return True
    return False

# Walk through client/src directory
count = 0
for root, dirs, files in os.walk('client/src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            if fix_urls_in_file(filepath):
                count += 1

print(f"\nTotal files updated: {count}")
