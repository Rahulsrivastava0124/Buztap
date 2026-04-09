import re

with open('src/pages/Landing.jsx', 'r') as f:
    text = f.read()

# Define boundaries
hero_end = text.find('      {/* ════════════════ 3. STATS BAR ═════════════════════════════ */}')
demo_start = text.find('      {/* ════════════════ 6. LIVE DEMO ════════════════════════════ */}')
demo_end = text.find('      {/* ════════════════ 7. PRICING ══════════════════════════════ */}')

if hero_end != -1 and demo_start != -1 and demo_end != -1:
    demo_section = text[demo_start:demo_end]
    
    # Remove demo section from original place
    new_text = text[:demo_start] + text[demo_end:]
    
    # Recalculate hero_end on the modified text
    hero_end = new_text.find('      {/* ════════════════ 3. STATS BAR ═════════════════════════════ */}')
    
    # Insert demo section just before Stats Bar
    final_text = new_text[:hero_end] + demo_section + new_text[hero_end:]
    
    with open('src/pages/Landing.jsx', 'w') as f:
        f.write(final_text)
    print("Success")
else:
    print("Failed to find boundaries")
