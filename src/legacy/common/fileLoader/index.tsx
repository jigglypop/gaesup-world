import { deleteImage, uploadImage } from "@api/images";
import { IUploadResponse } from "@api/type";
import { buttonRecipe } from "@styles/recipe/button.css";
import { inputRecipe } from "@styles/recipe/input.css";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import * as S from "./style.css";

export const useFileUpload = () => {
  return useMutation<IUploadResponse, Error, File, unknown>({
    mutationKey: ["image_upload"],
    mutationFn: async (file) => await uploadImage(file),
  });
};
export const useFileDelete = () => {
  return useMutation<IUploadResponse, Error, { imageName: string }, unknown>({
    mutationKey: ["image_delete"],
    mutationFn: async ({ imageName }) => await deleteImage(imageName),
  });
};
interface FileUploaderProps {
  value: string | null;
  onChange: (url: string) => void;
  label: string;
  accept?: string;
}
const FileUploader: React.FC<FileUploaderProps> = ({
  value,
  onChange,
  label,
  accept = "image/*",
}) => {
  const {
    mutate: uploadFile,
    isPending: isUploading,
    error: uploadError,
  } = useFileUpload();

  const {
    mutate: deleteFile,
    isPending: isDeleting,
    error: deleteError,
  } = useFileDelete();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file, {
        onSuccess: (data) => {
          onChange(data.imageUrl);
        },
        onError: (error) => {
          console.error("파일 업로드 에러:", error.message);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!value) return;
    deleteFile(
      { imageName: value },
      {
        onSuccess: () => {
          onChange("");
        },
        onError: (error) => {
          console.error("파일 삭제 에러:", error.message);
        },
      }
    );
  };

  return (
    <div className={S.fileUploader}>
      <div className={S.upperRow}>
        {value && (
          <input
            value={value}
            readOnly
            className={inputRecipe({
              white: true,
            })}
          />
        )}
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={S.fileInput}
          id={`fileUpload_${label}`}
        />
        <label
          htmlFor={`fileUpload_${label}`}
          className={buttonRecipe({ color: "mint" })}>
          {isUploading ? "업로드 중..." : "업로드"}
        </label>
      </div>
      {value && (
        <div className={S.lowerRow}>
          <div className={S.thumbnailContainer}>
            <img
              src={value}
              alt="thumbnail"
              className={S.thumbnail}
            />
          </div>
          <button
            onClick={handleDelete}
            className={buttonRecipe({ color: "fire" })}
            disabled={isDeleting}>
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      )}
      {(uploadError || deleteError) && (
        <div className={S.errorMessage}>
          {uploadError?.message || deleteError?.message}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
