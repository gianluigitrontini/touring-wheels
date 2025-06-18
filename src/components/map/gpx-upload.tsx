"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GpxUploadProps {
  onGpxUploaded: (gpxData: string, fileName: string) => void;
  className?: string;
}

export function GpxUpload({ onGpxUploaded, className }: GpxUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith(".gpx")) {
        processFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .gpx file.",
          variant: "destructive",
        });
      }
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".gpx")) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a .gpx file.",
          variant: "destructive",
        });
        return;
      }
    const reader = new FileReader();
    reader.onload = (e) => {
      const gpxData = e.target?.result as string;
      onGpxUploaded(gpxData, file.name);
      setFileName(file.name);
    };
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Could not read the GPX file. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setFileName(null);
    onGpxUploaded("", ""); // Notify parent that file is removed
    // Reset file input if needed, though it's tricky with controlled file inputs
    const fileInput = document.getElementById('gpx-file-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!fileName ? (
        <div
          className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragging ? "border-primary bg-accent/20" : "border-border hover:border-accent"}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('gpx-file-upload')?.click()}
        >
          <UploadCloud className="w-12 h-12 text-muted-foreground mb-3" />
          <Label htmlFor="gpx-file-upload" className="text-lg font-medium text-primary cursor-pointer">
            Drag & drop GPX file here
          </Label>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
          <Input
            id="gpx-file-upload"
            type="file"
            accept=".gpx"
            onChange={handleFileChange}
            className="hidden"
          />
           <p className="text-xs text-muted-foreground mt-4">Max file size: 5MB. Only .gpx files accepted.</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium text-foreground">{fileName}</p>
              <p className="text-sm text-muted-foreground">GPX file selected</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemoveFile} aria-label="Remove GPX file">
            <X className="w-5 h-5 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}
