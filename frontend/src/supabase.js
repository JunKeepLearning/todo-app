// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// 从环境变量中获取 Supabase 的 URL 和密钥
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Supabase 项目的 URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY; // Supabase 项目的密钥

export const supabase = createClient(supabaseUrl, supabaseKey); // 创建 Supabase 客户端实例
