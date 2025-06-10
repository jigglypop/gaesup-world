import { checkApi } from "@api/auth";
import Spinner from "@common/spinner";
import { useToast } from "@store/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import cache from "@utils/cache";
import { getRole } from "@utils/role";
import { useNavigate } from "react-router-dom";
import { userType } from "./type";

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

export function RequireLogin({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useCheck();
  const navigate = useNavigate();
  if (isUserLoading) return <Spinner />;
  if (!user) {
    navigate("/aggjack/auth/");
    return null;
  }
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useCheck();
  const navigate = useNavigate();
  if (isUserLoading) return <Spinner />;
  if (
    !user ||
    !(user as userType)?.roles ||
    getRole((user as userType)?.roles) < 2
  ) {
    navigate("/aggjack/auth/");
    return null;
  }
  return <>{children}</>;
}

export function RequireManager({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useCheck();
  const navigate = useNavigate();
  if (isUserLoading) return <Spinner />;
  if (
    !user ||
    !(user as userType)?.roles ||
    getRole((user as userType)?.roles) < 1
  ) {
    navigate("/aggjack/auth/");
    return null;
  }
  return <>{children}</>;
}

export default function Check({ children }: { children: React.ReactNode }) {
  useCheck();
  return <>{children}</>;
}
