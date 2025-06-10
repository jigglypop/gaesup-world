import { useAtom } from "jotai";
import { modalAtom } from "./atom";

export default function useModal() {
  const [modal, setModal] = useAtom(modalAtom);

  const closeModal = () => {
    setModal({
      on: false,
      type: "",
      file: -1,
      username: "",
      gltf_url: "",
    });
  };

  const openModal = ({
    file,
    type,
    username,
    gltf_url,
  }: {
    file?: number;
    type: string;
    username?: string;
    gltf_url?: string;
  }) => {
    setModal({
      on: true,
      type,
      file: file || -1,
      username: username || "",
      gltf_url: gltf_url || "",
    });
  };

  return {
    closeModal,
    openModal,
    isOpen: modal.on,
    fileName: modal.file,
    type: modal.type,
    username: modal.username,
    gltf_url: modal.gltf_url,
  };
}
