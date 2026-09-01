import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  label?: string;
  description?: string;
  maxSizeMb?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
  required?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label = 'Upload Supporting Documents',
  description = 'PDF, PNG, JPG up to 10MB',
  maxSizeMb = 10,
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  multiple = true,
  onFilesSelected,
  files,
  onRemoveFile,
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const validList: File[] = [];

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];

      // Check size
      if (file.size > maxSizeMb * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the ${maxSizeMb}MB size limit.`);
        continue;
      }

      // Check type if specified
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        // Also check by file extension for robustness
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const matchesExt = allowedTypes.some((t) => t.includes(ext.replace('.', '')));
        if (!matchesExt) {
          setErrorMessage(`"${file.name}" has an unsupported file type.`);
          continue;
        }
      }

      validList.push(file);
    }

    if (validList.length > 0) {
      if (multiple) {
        onFilesSelected([...files, ...validList]);
      } else {
        onFilesSelected([validList[0]]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-zinc-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Drag and Drop Zone */}
      <div
        id="dropzone-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleChange}
          accept={allowedTypes.join(',')}
          className="hidden"
          id="file-input-element"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700">
              <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-zinc-500 mt-1">{description}</p>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Selected Files ({files.length})
          </p>
          <div className="grid grid-cols-1 gap-2">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-white border border-zinc-200 rounded-lg shadow-2xs text-sm"
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-600">
                    <File className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-zinc-800 text-xs truncate">{file.name}</p>
                    <p className="text-[11px] text-zinc-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  id={`remove-file-btn-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(idx);
                  }}
                  className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
