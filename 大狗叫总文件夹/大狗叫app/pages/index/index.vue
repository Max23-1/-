<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">🐶 大狗叫</text>
      <text class="subtitle">点一下大狗，汪汪叫！</text>
    </view>

    <!-- 大狗区域 + 弹射的"叫"字 -->
    <view class="dog-area">
      <!-- 向四周弹射的"叫"字 -->
      <view
        v-for="(item, index) in particles"
        :key="'p' + index"
        class="particle"
        :style="particleStyle(item)"
      >
        <text>叫</text>
      </view>

      <!-- 大狗图片（点击切换 + 播放） -->
      <image
        class="dog-img"
        :src="dogSrc"
        mode="aspectFit"
        @tap="bark"
      />
    </view>

    <!-- 提示文字 -->
    <view class="tip">
      <text>👆 点击大狗 或 下面的按钮，让它叫！</text>
    </view>

    <!-- 按钮区 -->
    <view class="btn-group">
      <button class="bark-btn" @tap="bark">🐕 叫一声！</button>
      <button class="go-btn" @tap="goAbout">📖 大狗介绍</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 两张图片：平时 & 叫的时候
const dogNormal = '/static/大狗1.webp'
const dogBark = '/static/大狗叫.webp'

const dogSrc = ref(dogNormal)       // 当前显示的大狗图片
const particles = ref([])           // 弹射的"叫"字列表

// ===== 狗叫音频 =====
// 单点：原版狗叫；连点：一直用 大狗.mp3；大狗放完后，由 叫.mp3 收尾
const SRC_NORMAL = '/static/大狗叫_爱给网_aigei_com.mp3'   // 单点（正常一声）
const SRC_DOG = '/static/大狗.mp3'                          // 连点过程中
const SRC_RUSH = '/static/叫.mp3'                           // 连点停手后的收尾

const audioNormal = uni.createInnerAudioContext()
audioNormal.src = SRC_NORMAL
audioNormal.loop = false

const audioDog = uni.createInnerAudioContext()
audioDog.src = SRC_DOG
audioDog.loop = false

const audioRush = uni.createInnerAudioContext()
audioRush.src = SRC_RUSH
audioRush.loop = false

// 音量：连点越多越响（正常一声 0.7，封顶 1.0）
const VOL_BASE = 0.7    // 正常一声的音量
const VOL_STEP = 0.1    // 每多连点一次提高的音量
const VOL_MAX = 1.0     // 音量上限（音频音量范围 0~1）

// ===== 前面（大狗）阶段：不拉长，连点越多音调越高、越响 =====
const DOG_FALLBACK_MS = 1200   // 大狗.mp3 的兜底复位时间（正常由 onEnded 触发）
const PITCH_BASE = 1.0         // 连点第 2 声的音调（1 = 原音）
const PITCH_STEP = 0.08        // 每多连点一次升高的音调
const PITCH_MAX = 1.6          // 音调上限

// ===== 后面（叫）阶段：音量再高一点，并拉长（封顶 1.5 秒）=====
const RUSH_VOL_BONUS = 0.1    // 收尾这一声比大狗响一点点
const RUSH_TARGET_MIN = 1.0   // 收尾这一声的目标时长（秒）
const RUSH_TARGET_STEP = 0.25 // 每多连点一次，收尾再 +0.25 秒
const RUSH_TARGET_MAX = 1.5   // 收尾这一声的长度封顶（秒）
const RUSH_GAP_MS = 200       // 大狗放完 → 停顿 0.2 秒 → 再叫
let rushDuration = 0.552      // 叫.mp3 的时长（秒），onCanplay 后会自动更新

const RATE_MIN = 0.15     // 播放速率下限，防止拉得过狠

let burstCount = 0        // 这一连串点击的次数（0 = 当前没在响）
let isPlaying = false     // 这一连串是否还在响
let activeCtx = null      // 当前真正在响的那个音频（用来忽略 stop() 的误回调）
let resetTimer = null     // 兜底：一声结束后复位
let gapTimer = null       // 大狗与叫之间那 0.2 秒停顿的计时器

// 叫.mp3 的时长（用来算该放多慢）
audioRush.onCanplay(() => {
  if (audioRush.duration) rushDuration = audioRush.duration
})

// 当前这一串点击该用的音量 / 音调
function dogVolume() {
  return Math.min(VOL_BASE + (burstCount - 1) * VOL_STEP, VOL_MAX)
}
function dogPitch() {
  return Math.min(PITCH_BASE + (burstCount - 2) * PITCH_STEP, PITCH_MAX)
}

// 兜底：到时间还没收到结束回调，也复位
function armReset(ms) {
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(endBurst, ms + 400)
}

// 先清空"当前音源"再停，避免 stop() 误触发结束回调
function stopAll() {
  activeCtx = null
  if (gapTimer) { clearTimeout(gapTimer); gapTimer = null }   // 停顿期间又点了 → 取消停顿
  audioNormal.stop()
  audioDog.stop()
  audioRush.stop()
}

// 收尾：叫.mp3 —— 音量比大狗高一点点，并拉长（封顶 1.5 秒）
// 注意：uni-app 的 InnerAudioContext 只能调 playbackRate，做不到"升调的同时拉长"。
//       这里优先保"拉长"；音调的 +0.2（比大狗高一点）只有预览页（Web Audio）能做到。
function playRush() {
  stopAll()
  const target = Math.min(RUSH_TARGET_MIN + (burstCount - 2) * RUSH_TARGET_STEP, RUSH_TARGET_MAX)
  const stretch = Math.max(target / rushDuration, 1)   // 拉长倍数
  audioRush.volume = Math.min(dogVolume() + RUSH_VOL_BONUS, VOL_MAX)
  audioRush.playbackRate = Math.max(1 / stretch, RATE_MIN)
  audioRush.play()
  activeCtx = audioRush
  armReset(target * 1000)
}

// 大狗放完 → 先停 0.2 秒，再用 叫 收尾（这 0.2 秒里静音）
function armRush() {
  if (resetTimer) { clearTimeout(resetTimer); resetTimer = null }
  activeCtx = null                       // 停顿期间不响，忽略其它结束回调
  gapTimer = setTimeout(() => {
    gapTimer = null
    if (isPlaying && burstCount >= 1) playRush()
  }, RUSH_GAP_MS)
  armReset(RUSH_GAP_MS + RUSH_TARGET_MAX * 1000)   // 兜底
}

// 一声播完 / 出错 → 结束这一连串，下次点击重新算"正常一声"
function endBurst() {
  if (resetTimer) { clearTimeout(resetTimer); resetTimer = null }
  if (gapTimer) { clearTimeout(gapTimer); gapTimer = null }
  activeCtx = null
  isPlaying = false
  burstCount = 0
  audioNormal.volume = VOL_BASE
  audioDog.volume = VOL_BASE
  audioRush.volume = VOL_BASE
}

// 单点：原版狗叫放完就结束（逻辑不变，不用 叫 收尾）
audioNormal.onEnded(() => { if (activeCtx === audioNormal) endBurst() })
audioNormal.onError(() => { if (activeCtx === audioNormal) endBurst() })

// 大狗放完 → 如果这一串是"连点"（点过至少两次），停顿 0.2 秒后用 叫 收尾
audioDog.onEnded(() => {
  if (activeCtx !== audioDog) return
  if (burstCount >= 2) armRush()
  else endBurst()
})
audioDog.onError(() => { if (activeCtx === audioDog) endBurst() })

audioRush.onEnded(() => { if (activeCtx === audioRush) endBurst() })
audioRush.onError(() => { if (activeCtx === audioRush) endBurst() })

let timer = null
const colors = ['#ff6b35', '#e74c3c', '#f39c12', '#d63031', '#e17055', '#ff9f43', '#c0392b', '#fd9644']

// 核心功能：点击后切换图片、播放音频、弹射"叫"字
function bark() {
  // 1. 切换成"大狗叫"的图片
  dogSrc.value = dogBark

  // 2. 播放狗叫音频
  //    单点 → 原版狗叫，完了就结束（逻辑不变）
  //    连点 → 一直用 大狗.mp3，音调逐次升高、音量逐次提高；大狗放完后由 叫.mp3 收尾
  burstCount = isPlaying ? burstCount + 1 : 1
  isPlaying = true
  stopAll()

  if (burstCount === 1) {
    // 单点：原版狗叫，原样播放
    audioNormal.volume = VOL_BASE
    audioNormal.play()
    activeCtx = audioNormal
    armReset(1200)
  } else {
    // 连点：大狗.mp3，不拉长；音量逐次提高、音调逐次升高
    audioDog.volume = dogVolume()
    audioDog.playbackRate = dogPitch()
    audioDog.play()
    activeCtx = audioDog
    armReset(DOG_FALLBACK_MS)
  }

  // 3. 生成弹射的"叫"字
  spawnParticles()

  // 4. 记录叫声次数（供"记录"页使用）
  let count = uni.getStorageSync('barkCount') || 0
  count++
  uni.setStorageSync('barkCount', count)

  // 0.8 秒后恢复成平时的大狗图片
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    dogSrc.value = dogNormal
  }, 800)
}

// 向四周随机弹射若干"叫"字
function spawnParticles() {
  const list = []
  const count = 14
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5 // 均匀分布到 360°，再加点随机
    const dist = 70 + Math.random() * 110                         // 弹射距离
    list.push({
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: colors[i % colors.length],
      size: 22 + Math.random() * 18
    })
  }
  particles.value = list
  setTimeout(() => {
    particles.value = []
  }, 750)
}

// 每个"叫"字的位置/颜色/字号
function particleStyle(item) {
  return {
    '--dx': item.dx + 'px',
    '--dy': item.dy + 'px',
    color: item.color,
    'font-size': item.size + 'px'
  }
}

// 跳转到介绍页（tab 页用 switchTab）
function goAbout() {
  uni.switchTab({ url: '/pages/about/about' })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff3e0 0%, #ffe0b2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 30rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.title {
  font-size: 56rpx;
  font-weight: bold;
  color: #e8590c;
}

.subtitle {
  font-size: 28rpx;
  color: #8d6e63;
  margin-top: 12rpx;
}

.dog-area {
  position: relative;
  width: 500rpx;
  height: 500rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dog-img {
  width: 440rpx;
  height: 440rpx;
  border-radius: 40rpx;
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.15);
  background-color: #fff;
}

/* 弹射的"叫"字：从中心飞出并淡出 */
.particle {
  position: absolute;
  left: 50%;
  top: 50%;
  font-weight: bold;
  z-index: 10;
  animation: fly 0.72s ease-out forwards;
}

@keyframes fly {
  0% {
    transform: translate(-50%, -50%) scale(0.4);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.35);
    opacity: 0;
  }
}

.tip {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #8d6e63;
}

.btn-group {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.bark-btn {
  background: #ff6b35;
  color: #ffffff;
  border-radius: 50rpx;
  font-size: 34rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.go-btn {
  background: #ffffff;
  color: #e8590c;
  border: 2rpx solid #ff6b35;
  border-radius: 50rpx;
  font-size: 32rpx;
}

/* 去掉按钮默认边框 */
.bark-btn::after,
.go-btn::after {
  border: none;
}
</style>
