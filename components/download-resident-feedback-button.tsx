'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Download} from 'lucide-react';

export default function DownloadResidentFeedbackButton() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3001';
      const res = await fetch(`${base}/feedbacks/export`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resident-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download Resident Feedback. Please try again or contact support.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={downloading} className="w-full">
      <Download className="mr-2 h-4 w-4" />
      {downloading ? 'Preparing…' : 'Download Resident Feedback'}
    </Button>
  );
}