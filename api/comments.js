import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 (서버에서만 실행)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://miner7.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // 댓글 작성
      const { news_id, comment, recaptcha_token, fingerprint } = req.body;

      // reCAPTCHA 검증
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha_token}`
      });
      
      const recaptchaData = await recaptchaResponse.json();
      
      if (!recaptchaData.success || recaptchaData.score < 0.5) {
        return res.status(400).json({ error: 'reCAPTCHA validation failed' });
      }

      // IP 해시 생성
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const crypto = require('crypto');
      const ip_hash = crypto.createHash('sha256').update(clientIP).digest('hex');

      // 댓글 저장
      const { data, error } = await supabase
        .from('news_comments')
        .insert({
          news_id,
          comment,
          ip_hash,
          fingerprint,
          recaptcha_token
        });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ success: true, data });

    } else if (req.method === 'GET') {
      // 승인된 댓글 조회
      const { news_id } = req.query;

      const { data, error } = await supabase
        .from('news_comments')
        .select('*')
        .eq('news_id', news_id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ data });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}