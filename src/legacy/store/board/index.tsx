import useModal from "@store/modal";
import { useToast } from "@store/toast";
import useBoardQuery from "./query";
import { boardRequestType } from "./type";

export const useBoard = () => {
  const { addToastAsync } = useToast();
  const { closeModal } = useModal();
  const { onBoardCreate } = useBoardQuery();

  const closeModalAsync = async () => {
    closeModal();
  };

  const write = async (form: boardRequestType) => {
    await onBoardCreate(form);
    await closeModalAsync();
    await addToastAsync({ text: "방명록을 작성했습니다" });
  };

  return {
    write,
    onBoardCreate,
  };
};
