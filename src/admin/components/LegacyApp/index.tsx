import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ThreeContainer from "../ThreeContainer";
import Ground from "../Ground";
import UpdateGround from "../Ground/room";
import Loading from "../Loading";
import Toast from "../Toast";
import LeftSlider from "../LeftSlider";
import RightSlider from "../RightSlider";
import { Stats } from "@react-three/drei";

const ModalContainer = lazy(() => import("../Modal"));
const Main = lazy(() => import("../Main"));
const UpdateRoom = lazy(() => import("../UpdateRoom"));
const Auth = lazy(() => import("../Auth"));

export default function LegacyApp() {
  return (
    <>
      <Routes>
        <Route
          path="world"
          element={
            <>
              <ThreeContainer isUpdate={true}>
                <Stats />
                <Main />
                <Ground />
              </ThreeContainer>
            </>
          }
        />
        <Route
          path="room"
          element={
            <>
              <LeftSlider />
              <RightSlider />
              <ThreeContainer isUpdate={false}>
                <Stats />
                <UpdateRoom />
                <UpdateGround />
              </ThreeContainer>
            </>
          }
        />
        <Route
          path="auth"
          element={<Auth />}
        />
        <Route
          path=""
          element={
            <>
              <ThreeContainer isUpdate={true}>
                <Stats />
                <Main />
                <Ground />
              </ThreeContainer>
            </>
          }
        />
      </Routes>
      <ModalContainer />
      <Toast />
      <Loading />
    </>
  );
} 