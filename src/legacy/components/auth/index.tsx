"use client";

import useAuth from "@store/auth";
import { buttonRecipe } from "@styles/recipe/button.css";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import { useState } from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import * as S from "./style.css";
import { loginFormType, registerFormType } from "./type";

const loginSchema = {
  email: Yup.string()
    .max(30, "30자 이내로 입력해주세요.")
    .required("이메일 아이디를 입력해주세요"),
  password: Yup.string()
    .max(30, "30자 이내로 입력해주세요.")
    .required("비밀번호를 입력해주세요"),
};

const passwordConfirmSchema = {
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "비밀번호가 일치하지 않습니다.")
    .required("동일한 비밀번호를 한번 더 입력해주세요"),
};

const registerSchema = Object.assign({}, loginSchema, passwordConfirmSchema);

const loginInitialValues = {
  email: "",
  password: "",
  isValid: false,
};

const registerInitialValues = {
  email: "",
  password: "",
  passwordConfirm: "",
  isValid: false,
};

export default function Auth() {
  const [type, setType] = useState<"login" | "register">("login");
  const { login, loginError, register, registerError } = useAuth();
  const onLoginOrRegister = (e: loginFormType | registerFormType) => {
    return type === "login" ? login(e) : register(e);
  };

  return (
    <div className={S.auth}>
      <div className={S.forms}>
        <Formik
          initialValues={
            type === "login" ? loginInitialValues : registerInitialValues
          }
          validationSchema={Yup.object(type ? loginSchema : registerSchema)}
          onSubmit={(e) => {
            return onLoginOrRegister(e);
          }}>
          {(
            props: FormikProps<{
              email: string;
              password: string;
              isValid: boolean;
            }>
          ) => (
            <Form className={S.form}>
              <p className={`${S.Title}`}>아그작</p>
              <p className={`${S.loginTitle}`}>
                {type === "login" ? "로그인" : "회원가입"}
              </p>
              <div className={S.fieldOuter}>
                <p className={`${S.discription}`}>* 이메일 아이디 : (필수)</p>
                <Field
                  name="email"
                  type="text"
                  placeholder="이메일 아이디"
                  className={S.field}
                />

                <div className={S.errorDiv}>
                  <ErrorMessage
                    component="div"
                    name="email"
                    className={S.errorMsg}
                  />
                </div>
              </div>
              {type === "register" && (
                <div className={S.fieldOuter}>
                  <p className={`${S.discription}`}>* 닉네임</p>
                  <Field
                    name="name"
                    type="text"
                    placeholder="닉네임"
                    className={S.field}
                  />

                  <div className={S.errorDiv}>
                    <ErrorMessage
                      component="div"
                      name="name"
                      className={S.errorMsg}
                    />
                  </div>
                </div>
              )}

              <div className={S.fieldOuter}>
                <p className={`${S.discription}`}>* 비밀번호 : (필수)</p>
                <Field
                  name="password"
                  type="password"
                  placeholder="비밀번호"
                  className={S.field}
                />
                <div className={S.errorDiv}>
                  <ErrorMessage
                    component="div"
                    name="password"
                    className={S.errorMsg}
                  />
                </div>
                {type === "register" && (
                  <>
                    <p className={`${S.discription}`}>* 비밀번호 확인</p>

                    <Field
                      name="passwordConfirm"
                      type="password"
                      placeholder="비밀번호 확인"
                      className={S.field}
                    />
                    <div className={S.errorDiv}>
                      <ErrorMessage
                        component="div"
                        name="passwordConfirm"
                        className={S.errorMsg}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className={S.under}>
                <div className={S.underInner}>
                  <Link
                    to="/aggjack/"
                    type="submit"
                    className={`${S.underButton} ${buttonRecipe({
                      color: "gray",
                    })}`}>
                    홈
                  </Link>
                  <button
                    type="submit"
                    className={`${S.underButton} ${buttonRecipe({
                      disabled: !props.isValid,
                      color: "gray",
                    })}`}
                    disabled={!props.isValid}>
                    제출
                  </button>
                </div>

                <div className={S.toggleAuth}>
                  {type === "login" ? (
                    <>
                      <p>아직 회원이 아니신가요? </p>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setType("register");
                        }}
                        className={buttonRecipe({
                          color: "purple",
                        })}>
                        회원가입
                      </button>
                    </>
                  ) : (
                    <>
                      <p>이미 회원이신가요? </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setType("login");
                        }}
                        className={buttonRecipe({
                          color: "purple",
                        })}>
                        로그인
                      </button>
                    </>
                  )}
                </div>
                {registerError && (
                  <div className={S.errorMsg}>
                    [ 회원가입 에러 ] : {registerError.message}
                  </div>
                )}
                {loginError && (
                  <div className={S.errorMsg}>
                    [ 로그인 에러 ] : {loginError.message}
                  </div>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
