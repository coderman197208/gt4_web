/**
 * WebSocket 订阅管理器
 * 管理每个连接的订阅列表
 */

export class SubscriptionManager {
  // 存储每个socket的订阅标签集合
  private subscriptions: Map<string, Set<string>> = new Map();

  /**
   * 添加新连接
   * @param socketId Socket连接ID
   */
  addConnection(socketId: string): void {
    if (!this.subscriptions.has(socketId)) {
      this.subscriptions.set(socketId, new Set());
      console.log(`[SubscriptionManager] 新连接已添加: ${socketId}`);
    }
  }

  /**
   * 更新连接的订阅列表（全量替换）
   * @param socketId Socket连接ID
   * @param tags 订阅的标签列表
   */
  updateSubscriptions(socketId: string, tags: string[]): void {
    if (!this.subscriptions.has(socketId)) {
      this.addConnection(socketId);
    }
    
    // 全量替换订阅列表
    const tagSet = new Set(tags);
    this.subscriptions.set(socketId, tagSet);
    
    console.log(`[SubscriptionManager] 连接 ${socketId} 订阅已更新:`, Array.from(tagSet));
  }

  /**
   * 移除连接及其订阅
   * @param socketId Socket连接ID
   */
  removeConnection(socketId: string): void {
    if (this.subscriptions.has(socketId)) {
      this.subscriptions.delete(socketId);
      console.log(`[SubscriptionManager] 连接已移除: ${socketId}`);
    }
  }

  /**
   * 获取订阅了指定标签的所有Socket ID列表
   * @param tag 标签名称
   * @returns 订阅了该标签的Socket ID数组
   */
  getSubscribers(tag: string): string[] {
    const subscribers: string[] = [];
    
    for (const [socketId, tags] of this.subscriptions.entries()) {
      if (tags.has(tag)) {
        subscribers.push(socketId);
      }
    }
    
    return subscribers;
  }

  /**
   * 获取当前活跃连接数
   */
  getConnectionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * 检查是否有至少一个活跃连接
   */
  hasActiveConnections(): boolean {
    return this.subscriptions.size > 0;
  }
}
