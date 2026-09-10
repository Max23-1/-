<template>
  <view class="container">
    <!-- 统计卡片 -->
    <view class="stat-card">
      <text class="stat-num">{{ barkCount }}</text>
      <text class="stat-label">累计叫声次数</text>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <button class="btn primary" @tap="refresh">🔄 刷新</button>
      <button class="btn danger" @tap="reset">🗑 清零</button>
    </view>

    <!-- 提示 -->
    <view class="tip">
      <text>去「大狗叫」页点击大狗，这里的次数就会增加哦～</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const barkCount = ref(0)

// 每次进入/切换到这个页时，刷新计数
onShow(() => {
  refresh()
})

function refresh() {
  barkCount.value = uni.getStorageSync('barkCount') || 0
}

function reset() {
  uni.showModal({
    title: '提示',
    content: '确定要清零叫声记录吗？',
    success(res) {
      if (res.confirm) {
        uni.setStorageSync('barkCount', 0)
        barkCount.value = 0
        uni.showToast({ title: '已清零', icon: 'success' })
      }
    }
  })
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

.stat-card {
  width: 100%;
  background: #ffffff;
  border-radius: 30rpx;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.stat-num {
  font-size: 100rpx;
  font-weight: bold;
  color: #ff6b35;
}

.stat-label {
  font-size: 28rpx;
  color: #8d6e63;
  margin-top: 16rpx;
}

.actions {
  width: 100%;
  margin-top: 40rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.btn {
  flex: 1;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.primary {
  background: #ff6b35;
  margin-right: 20rpx;
}

.danger {
  background: #e74c3c;
}

.btn::after {
  border: none;
}

.tip {
  margin-top: 40rpx;
  font-size: 26rpx;
  color: #8d6e63;
  text-align: center;
  padding: 0 20rpx;
}
</style>
