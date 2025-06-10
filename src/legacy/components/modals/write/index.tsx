"use client";

import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";

import { useBoard } from "@store/board";
import { boardRequestType } from "@store/board/type";
import { buttonRecipe } from "@styles/recipe/button.css";
import * as Yup from "yup";
import * as S from "./styles.css";

const writeMessageSchema = {
  title: Yup.string()
    .max(10, "10자 이내로 입력해주세요.")
    .required("닉네임을 입력해주세요"),
  content: Yup.string()
    .max(50, "50자 이내로 입력해주세요.")
    .required("내용을 입력해주세요"),
};

const writeMessageInitialValues = {
  title: "",
  content: "",
};

export default function WriteMessage() {
  const { write } = useBoard();

  return (
    <>
      <div className={S.deleteStyle}>
        <Formik
          initialValues={writeMessageInitialValues}
          validationSchema={Yup.object(writeMessageSchema)}
          onSubmit={(e) => {
            write(e as unknown as boardRequestType);
          }}>
          {(
            props: FormikProps<{
              title: string;
              content: string;
            }>
          ) => (
            <Form className={S.form}>
              <p className={`${S.text}`}>방명록 작성</p>
              <div className={S.fieldOuter}>
                <p className={`${S.discription}`}>
                  * 닉네임 : (10자 이내 필수)
                </p>
                <Field
                  name="title"
                  type="text"
                  placeholder="닉네임"
                  className={S.field}
                />
                <div className={S.errorDiv}>
                  <ErrorMessage
                    component="div"
                    name="title"
                    className={S.errorMsg}
                  />
                </div>
              </div>
              <div className={S.fieldOuter}>
                <p className={`${S.discription}`}>* 내용 : (100자 이내 필수)</p>
                <Field
                  name="content"
                  type="text"
                  component="textarea"
                  placeholder="내용"
                  className={S.textAreaField}
                />
                <div className={S.errorDiv}>
                  <ErrorMessage
                    component="div"
                    name="content"
                    className={S.errorMsg}
                  />
                </div>
              </div>
              <div className={S.under}>
                <button
                  type="submit"
                  className={buttonRecipe({
                    disabled: props.isValid,
                  })}
                  disabled={!props.isValid}
                  onClick={(e) => {
                    e.preventDefault();
                    props.submitForm();
                  }}>
                  제출
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}
