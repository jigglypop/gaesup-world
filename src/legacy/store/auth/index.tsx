"use client";

import { loginApi, registerApi } from "@api/auth";
import { loginFormType, userType } from "@store/check/type";
import { useToast } from "@store/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutateAsync: login, error: loginError } = useMutation<
    userType,
    Error,
    loginFormType
  >({
    mutationKey: ["user"],
    mutationFn: (e) => loginApi(e),
    onSuccess: async (res) => {
      return new Promise((resolve) => {
        const result = queryClient.setQueryData(["user"], res);
        resolve(result);
      }).then(() => {
        navigate("/aggjack/room");
        addToast({ text: "로그인이 완료되었습니다" });
      });
    },
    onError: async (error) => {
      addToast({
        text: "로그인 실패: " + error.message,
        type: { type: "error" },
      });
    },
  });

  const { mutateAsync: register, error: registerError } = useMutation<
    userType,
    Error,
    loginFormType
  >({
    mutationKey: ["user"],
    mutationFn: (e) => registerApi(e),
    onSuccess: async (res) => {
      return new Promise((resolve) => {
        const result = queryClient.setQueryData(["user"], res);
        resolve(result);
      }).then(() => {
        navigate("/aggjack/");
        addToast({ text: "회원가입이 완료되었습니다" });
      });
    },
    onError: async (error) => {
      addToast({
        text: "회원가입 실패: " + error.message,
        type: { type: "error" },
      });
    },
  });

  return {
    login,
    loginError,
    register,
    registerError,
  };
}
