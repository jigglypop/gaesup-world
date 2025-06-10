import { useAtom } from "jotai";
import { loadingAtom } from "./atom";

export default function useLoading() {
  const [loading, setLoading] = useAtom(loadingAtom);

  return {
    loading,
    setLoading,
  };
}
