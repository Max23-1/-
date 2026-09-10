/*
 * 把 叫.mp3 转成 base64，写进 预览音频数据.js，供 预览效果.html 用 Web Audio 做"变调+拉长"。
 *
 * 为什么需要它：浏览器在 file:// 下禁止 fetch 本地文件，Web Audio 拿不到音频数据，
 * 所以只能把音频内嵌成一个 js 文件，用 <script src> 加载。
 *
 * 换过 叫.mp3 之后，在本目录执行：  node 生成预览音频数据.js
 */
const fs = require('fs');

const SRC = '叫.mp3';
const OUT = '预览音频数据.js';

const b64 = fs.readFileSync(SRC).toString('base64');
fs.writeFileSync(OUT,
  '// 自动生成，请勿手动修改。重新生成：node 生成预览音频数据.js\n' +
  '// 来源：' + SRC + '\n' +
  'window.RUSH_AUDIO_B64 = "' + b64 + '";\n',
  'utf8');

console.log('已生成 ' + OUT + '（' + SRC + ' -> ' + b64.length + ' 个 base64 字符）');
