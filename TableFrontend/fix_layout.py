with open('src/pages/Landing.jsx', 'r') as f:
    text = f.read()

demo_start = text.find('      {/* ════════════════ 6. LIVE DEMO ════════════════════════════ */}')
stats_start = text.find('      {/* ════════════════ 3. STATS BAR ═════════════════════════════ */}')
pricing_start = text.find('      {/* ════════════════ 7. PRICING ══════════════════════════════ */}')

if demo_start != -1 and stats_start != -1 and demo_start < stats_start:
    # 6 is currently above 3.
    demo_section = text[demo_start:stats_start]
    
    new_text = text[:demo_start] + text[stats_start:]
    pricing_idx = new_text.find('      {/* ════════════════ 7. PRICING ══════════════════════════════ */}')
    
    final_text = new_text[:pricing_idx] + demo_section + new_text[pricing_idx:]
    
    with open('src/pages/Landing.jsx', 'w') as f:
        f.write(final_text)
    print("Reverted 6 successfully")
else:
    print("Failed to find boundaries or order is unexpected")
