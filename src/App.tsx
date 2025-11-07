import { BrowserRouter } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.layer.css";
import "./App.css";
import AppContents from "./AppContents";
import { Notifications } from "@mantine/notifications";
import theme from "./Theme/Theme";



function App() {
  return (
    <>
      <MantineProvider theme={theme}>
        <BrowserRouter>
          <Notifications position="top-right" />
          <AppContents />
        </BrowserRouter>
      </MantineProvider>
    </>
  );
}

export default App;
