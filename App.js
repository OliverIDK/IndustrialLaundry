import "react-native-gesture-handler";
import Navigation from "./Navigation";
import { Provider as PaperProvider } from "react-native-paper";
export default function App() {
  return (
    <PaperProvider>
      <Navigation />
    </PaperProvider>
  );
}
