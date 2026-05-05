import re

# UPDATE INDEX.CSS
with open('src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Root colors
css = re.sub(r'--bg-primary: #[0-9a-fA-F]+;', '--bg-primary: #0a0c10;', css)
css = re.sub(r'--bg-ink: #[0-9a-fA-F]+;', '--bg-ink: #11141c;', css)
css = re.sub(r'--accent-primary: #[0-9a-fA-F]+;', '--accent-primary: #3b82f6;', css) 
css = re.sub(r'--accent-hover: #[0-9a-fA-F]+;', '--accent-hover: #60a5fa;', css)
css = re.sub(r'--accent-secondary: #[0-9a-fA-F]+;', '--accent-secondary: #64748b;', css) 
css = re.sub(r'--accent-tertiary: #[0-9a-fA-F]+;', '--accent-tertiary: #94a3b8;', css)
css = re.sub(r'--accent-blue: #[0-9a-fA-F]+;', '--accent-blue: #0284c7;', css)
css = re.sub(r'--surface: rgba\([^)]+\);', '--surface: rgba(15, 23, 42, 0.7);', css)
css = re.sub(r'--surface-strong: rgba\([^)]+\);', '--surface-strong: rgba(30, 41, 59, 0.9);', css)
css = re.sub(r'--glass-bg: rgba\([^)]+\);', '--glass-bg: rgba(15, 23, 42, 0.6);', css)
css = re.sub(r'--glass-border: rgba\([^)]+\);', '--glass-border: rgba(255, 255, 255, 0.08);', css)
css = re.sub(r'--text-primary: #[0-9a-fA-F]+;', '--text-primary: #f8fafc;', css)
css = re.sub(r'--text-secondary: #[0-9a-fA-F]+;', '--text-secondary: #94a3b8;', css)

# Replace all cyan rgba(94, 234, 212, ...) with blue rgba(59, 130, 246, ...)
css = re.sub(r'rgba\(94,\s*234,\s*212,', 'rgba(59, 130, 246,', css)
# Replace purple rgba(196, 181, 253, ...) with slate rgba(100, 116, 139, ...)
css = re.sub(r'rgba\(196,\s*181,\s*253,', 'rgba(100, 116, 139,', css)
# Replace light blue rgba(95, 213, 255, ...) with darker blue rgba(2, 132, 199, ...)
css = re.sub(r'rgba\(95,\s*213,\s*255,', 'rgba(2, 132, 199,', css)
# Replace yellow rgba(245, 196, 81, ...) with muted silver/blue rgba(148, 163, 184, ...)
css = re.sub(r'rgba\(245,\s*196,\s*81,', 'rgba(148, 163, 184,', css)
# Replace purple-ish rgba(143, 92, 255, ...) with indigo rgba(79, 70, 229, ...)
css = re.sub(r'rgba\(143,\s*92,\s*255,', 'rgba(79, 70, 229,', css)

# Replace specific hardcoded colors
css = css.replace('#14b8a6', '#2563eb')
css = css.replace('#38bdf8', '#3b82f6')
css = css.replace('#7c3aed', '#1e40af')
css = css.replace('#cffafe', '#e0e7ff')

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('Done index.css')

# UPDATE HOME.JSX
with open('src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    home = f.read()

home = home.replace(
    "'linear-gradient(137deg, #5EEAD4 0%, #BAE6FD 45%, #38BDF8 100%)'",
    "'linear-gradient(137deg, #1e293b 0%, #334155 45%, #475569 100%)'"
)
home = home.replace(
    "'linear-gradient(137deg, #FFFFFF 0%, #A5B4FC 45%, #06B6D4 100%)'",
    "'linear-gradient(137deg, #0f172a 0%, #1e293b 45%, #334155 100%)'"
)
home = home.replace(
    "'linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #22D3EE 100%)'",
    "'linear-gradient(137deg, #1e1b4b 0%, #312e81 45%, #3730a3 100%)'"
)

with open('src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(home)
print('Done Home.jsx')
