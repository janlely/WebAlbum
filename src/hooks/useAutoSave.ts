// 自动保存Hook - 监听数据变化并实时保存

import { useEffect, useRef } from 'react';
import type { AlbumPage } from '../types';

interface UseAutoSaveOptions {
  enabled?: boolean;
  delay?: number; // 防抖延迟（毫秒）
}

/**
 * 自动保存Hook
 * @param data 要保存的数据
 * @param saveFunction 保存函数
 * @param options 配置选项
 */
export const useAutoSave = (
  data: AlbumPage | null,
  saveFunction: (page: AlbumPage) => Promise<void>,
  options: UseAutoSaveOptions = {}
) => {
  const { enabled = true, delay = 500 } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveDataRef = useRef<string>('');
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    // 如果禁用自动保存或无数据，直接返回
    if (!enabled || !data) return;
    
    // 首次挂载时不保存，只记录初始数据
    if (isInitialMount.current) {
      lastSaveDataRef.current = JSON.stringify(data);
      isInitialMount.current = false;
      return;
    }
    
    // 序列化数据用于比较
    const currentDataString = JSON.stringify(data);
    
    // 如果数据没有变化，不需要保存
    if (currentDataString === lastSaveDataRef.current) {
      return;
    }
    
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 设置新的保存定时器（防抖）
    timeoutRef.current = setTimeout(async () => {
      try {
        console.log(`[自动保存] 开始保存页面: ${data.name}`);
        await saveFunction(data);
        lastSaveDataRef.current = currentDataString;
        console.log(`[自动保存] 保存成功: ${data.name}`);
      } catch (error) {
        console.error(`[自动保存] 保存失败: ${data.name}`, error);
        // 保存失败时不更新lastSaveDataRef，下次仍会尝试保存
      }
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFunction, enabled, delay]);
  
  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // 手动触发保存（可用于强制保存）
  const forceSave = async () => {
    if (!data || !enabled) return;
    
    // 清除防抖定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    try {
      console.log(`[手动保存] 开始保存页面: ${data.name}`);
      await saveFunction(data);
      lastSaveDataRef.current = JSON.stringify(data);
      console.log(`[手动保存] 保存成功: ${data.name}`);
    } catch (error) {
      console.error(`[手动保存] 保存失败: ${data.name}`, error);
      throw error;
    }
  };
  
  return { forceSave };
};
