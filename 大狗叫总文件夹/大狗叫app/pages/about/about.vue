<template>
  <view class="container">
    <!-- 大狗卡片 -->
    <view class="card">
      <image class="dog-img" src="/static/大狗1.webp" mode="aspectFit" />
      <text class="name">大狗</text>
      <text class="desc">这是一只憨态可掬的大狗，点击它就会汪汪叫！</text>
    </view>

    <!-- 介绍信息（标签 label + 内容） -->
    <view class="info">
      <view class="info-item">
        <text class="info-label">品种</text>
        <text class="info-value">大黄狗</text>
      </view>
      <view class="info-item">
        <text class="info-label">特点</text>
        <text class="info-value">叫声洪亮、爱吃骨头</text>
      </view>
      <view class="info-item">
        <text class="info-label">技能</text>
        <text class="info-value">点击会叫、还会弹出"叫"字</text>
      </view>
    </view>

    <!-- 按钮 -->
    <button class="btn" @tap="goIndex">🐶 去找大狗玩</button>
  </view>
</template>

<script setup>
function goIndex() {
  uni.switchTab({ url: '/pages/index/index' })
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

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  border-radius: 30rpx;
  padding: 30rpx;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.dog-img {
  width: 320rpx;
  height: 320rpx;
  border-radius: 24rpx;
}

.name {
  font-size: 44rpx;
  font-weight: bold;
  color: #e8590c;
  margin-top: 20rpx;
}

.desc {
  font-size: 28rpx;
  color: #8d6e63;
  margin-top: 12rpx;
  text-align: center;
}

.info {
  width: 100%;
  background: #ffffff;
  border-radius: 30rpx;
  margin-top: 30rpx;
  padding: 10rpx 30rpx;
  box-sizing: border-box;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.info-item {
  display: flex;
  align-items: center;
  padding: 26rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #ffffff;
  background: #ff6b35;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  margin-right: 20rpx;
}

.info-value {
  font-size: 28rpx;
  color: #5d4037;
}

.btn {
  margin-top: 40rpx;
  width: 100%;
  background: #ff6b35;
  color: #ffffff;
  border-radius: 50rpx;
  font-size: 34rpx;
  font-weight: bold;
}

.btn::after {
  border: none;
}
</style>
