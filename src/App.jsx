import { useTurboApp } from "./hooks/useTurboApp.js";
import { AppShell } from "./components/composite/AppShell.jsx";

export default function App() {
  return <AppShell {...useTurboApp()} />;
}
