import "@styles/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "jotai";
import { DevTools } from "jotai-devtools";
import "jotai-devtools/styles.css";
import ReactDOM from "react-dom/client";
import App from "./App";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider>
    <QueryClientProvider client={queryClient}>
      <div style={{ zIndex: 100000 }}>
        <DevTools />
        <ReactQueryDevtools initialIsOpen={true} />
      </div>
      <App />
    </QueryClientProvider>
  </Provider>
);
