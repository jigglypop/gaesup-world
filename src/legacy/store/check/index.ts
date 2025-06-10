import { checkApi } from "@api/auth";
import { useToast } from "@store/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import cache from "@utils/cache";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// owner 인지 체크하고 아니면 홈으로 리다이렉트 시키는 커스텀 훅
export const useAdminEffect = () => {
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: checkApi,
  });
  useEffect(() => {
    if (!user || user.id !== 1) {
      navigate("/");
    }
  }, [user]);
};

// 체크로직, 로그아웃 로직
export const useCheck = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUerError,
    isSuccess: isUserSuccess,
  } = useQuery({
    queryKey: ["user"],
    queryFn: checkApi,
    staleTime: Infinity,
  });
  const onLogout = async () => {
    return new Promise((resolve) => {
      queryClient.setQueryData(["user"], null);
      resolve(cache.remove("token"));
    }).then(() => {
      navigate("/aggjack/");
      addToast({ text: "로그아웃이 완료되었습니다" });
    });
  };

  return { user, isUerError, isUserLoading, isUserSuccess, onLogout };
};
