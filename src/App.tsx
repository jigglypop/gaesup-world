import Main from "@components/main";
import { Provider } from "jotai";
import { DevTools, useAtomsDebugValue } from "jotai-devtools";
import "./styles/global.css";

const DebugAtoms = () => {
  useAtomsDebugValue();
  return null;
};

export default function App() {
  return (
    <Provider>
      <DebugAtoms />
      <DevTools />
      <Main />
    </Provider>
  );
}
