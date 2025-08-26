// 自动保存Hook - 事件驱动保存

import { useEffect, useRef, useCallback } from 'react';
import type { AlbumPage } from '../types';

interface UseAutoSaveOptions {
  enabled?: boolean;
}

/**
 * 自动保存Hook (事件驱动)
 * @param data 要保存的数据
 * @param saveFunction 保存函数
 * @param options 配置选项
 */
export const useAutoSave = (
  data: AlbumPage | null,
  saveFunction: (page: AlbumPage) => Promise<void>,
  options: UseAutoSaveOptions = {}
) => {
  const { enabled = true } = options;
  
  const lastSaveDataRef = useRef<string>('');
  const isInitialMount = useRef(true);
  
  // 事件驱动保存函数
  const saveOnChange = useCallback(async () => {
    if (!enabled || !data) return;
    
    // 序列化数据用于比较
    const currentDataString = JSON.stringify(data);
    
    // 如果数据没有变化，不需要保存
    if (currentDataString === lastSaveDataRef.current) {
      return;
    }
    
    try {
      console.log(`[事件保存] 开始保存页面: ${data.name}`);
      await saveFunction(data);
      lastSaveDataRef.current = currentDataString;
      console.log(`[事件保存] 保存成功: ${data.name}`);
    } catch (error) {
      console.error(`[事件保存] 保存失败: ${data.name}`, error);
    }
  }, [data, saveFunction, enabled]);
  
  // 初始化时记录初始数据
  useEffect(() => {
    if (!enabled || !data) return;
    
    if (isInitialMount.current) {
      lastSaveDataRef.current = JSON.stringify(data);
      isInitialMount.current = false;
    }
  }, [data, enabled]);
  
  // 返回保存函数供外部调用
  return { saveOnChange };
};
