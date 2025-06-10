import { getBoards, postBoard } from "@api/board";
import { minute } from "@constants/time";
import useModal from "@store/modal";
import { useToast } from "@store/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardMap, boardRequestType } from "./type";

export default function useBoardQuery() {
  const queryClient = useQueryClient();
  const { addToastAsync } = useToast();
  const { closeModal } = useModal();
  const { data } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
    staleTime: 10 * minute,
  });

  const { mutateAsync: onBoardCreate } = useMutation({
    mutationKey: ["boards"],
    mutationFn: async (form: boardRequestType): Promise<boardMap> => {
      return await postBoard(form);
    },
    onSuccess: async (res: boardMap) => {
      await queryClient.setQueryData(["boards"], res);
      await addToastAsync({ text: "업데이트되었습니다." });
      closeModal();
    },
    onError: async (error) => {
      addToastAsync({ text: "업데이트 실패: " + error.message });
    },
  });

  return {
    boardMap: data,
    onBoardCreate,
  };
}
