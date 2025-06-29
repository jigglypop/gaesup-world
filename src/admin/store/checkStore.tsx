import { useAuthStore } from "./authStore";
import Spinner from "../components/Spinner";
import { useToast } from "./toastStore";
import { useNavigate } from "react-router-dom";
import { userType } from "./types";
import { useEffect, useState } from "react";
import { checkApi } from "../api/auth";

export const useCheck = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<userType | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isUerError, setIsUserError] = useState(false);
  const [isUserSuccess, setIsUserSuccess] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await checkApi();
        setUser(userData);
        setIsUserSuccess(true);
        setIsUserError(false);
      } catch (error) {
        setIsUserError(true);
        setIsUserSuccess(false);
        setUser(null);
      } finally {
        setIsUserLoading(false);
      }
    };

    checkUser();
  }, []);

  const onLogout = async () => {
    setUser(null);
    setIsUserSuccess(false);
    navigate("/admin/world/");
    addToast({ text: "로그아웃이 완료되었습니다" });
  };

  return { user, isUerError, isUserLoading, isUserSuccess, onLogout };
};

export function RequireLogin({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useCheck();
  const navigate = useNavigate();
  
  if (isUserLoading) return <Spinner />;
  if (!user) {
    navigate("/admin/auth/");
    return null;
  }
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useCheck();
  const navigate = useNavigate();
  
  if (isUserLoading) return <Spinner />;
  if (!user || !user.roles || !user.roles.includes('admin')) {
    navigate("/admin/auth/");
    return null;
  }
  return <>{children}</>;
}

export function RequireManager({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useCheck();
  const navigate = useNavigate();
  
  if (isUserLoading) return <Spinner />;
  if (!user || !user.roles || (!user.roles.includes('manager') && !user.roles.includes('admin'))) {
    navigate("/admin/auth/");
    return null;
  }
  return <>{children}</>;
}

export default function Check({ children }: { children: React.ReactNode }) {
  useCheck();
  return <>{children}</>;
} 