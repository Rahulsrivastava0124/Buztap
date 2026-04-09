with open('src/pages/Landing.jsx', 'r') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if '════════════════ 2. HERO' in line or '════════════════ 6. LIVE DEMO' in line or '════════════════ 3. STATS BAR' in line:
        print(f"{i+1}: {line.strip()}")
