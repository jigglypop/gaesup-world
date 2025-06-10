interface FileUploaderProps {
  value: string;
  onChange: (value: string) => void;
  onFileUpload: (file: File) => Promise<void>;
  label: string;
  accept?: string;
}

export type IFileUploader = React.FC<FileUploaderProps>;
