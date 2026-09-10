import re, io, glob, sys

path = [p for p in glob.glob('*.html') if p != 'project.html'][0]
s = io.open(path, encoding='utf-8').read()
blocks = re.findall(r'<script>(.*?)</script>', s, re.S)
io.open('_check.js', 'w', encoding='utf-8').write(blocks[-1])
sys.stderr.write('file=%s blocks=%d chars=%d\n' % (path, len(blocks), len(blocks[-1])))
