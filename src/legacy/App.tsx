"use client";

import Denied from "@common/authHeader";

import Ground from "@common/ground";
import UpdateGround from "@common/ground/room";
import Loading from "@components/loading";
import Toast from "@components/toast";
import LeftSlider from "@containers/leftSlider";
import RightSlider from "@containers/rightSlider";
import ThreeContainer from "@containers/three";
import { Stats } from "@react-three/drei";
import Check, { RequireManager } from "@store/check/checkEffect";
import "@styles/global.css";
import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./styles.css";
const ModalContainer = lazy(() => import("@containers/modal"));
const Main = lazy(() => import("@containers/main"));
const UpdateRoom = lazy(() => import("@containers/updateRoom"));
const Auth = lazy(() => import("@components/auth"));

export default function App() {
  return (

  );
}
