
'use client';
import {useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {toast} from '@/components/ui/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function UploadBudgetDialog({open, onOpenChange}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast({title: 'PDF required', description: 'Please select a PDF file to upload.'});
      return;
    }
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/budget-transparency/upload', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Upload failed');
      }
      toast({title: 'Success', description: 'Budget Transparency Document uploaded.'});
      onOpenChange(false);
      setFile(null);
    } catch (e:any) {
      toast({title: 'Upload failed', description: e?.message || 'Please try again.'});
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Budget Transparency Document</DialogTitle>
          <DialogDescription>Only PDF is allowed. Uploading will overwrite the previous file.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e)=> setFile(e.target.files?.[0] || null)}
          />
          {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=> onOpenChange(false)} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={isUploading || !file}>
            {isUploading ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
