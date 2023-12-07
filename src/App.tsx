import { Provider } from "jotai";
import { DevTools, useAtomsDebugValue } from "jotai-devtools";
import Main from "./components/main";
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
