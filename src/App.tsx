import { BrowserRouter } from "react-router-dom";
import {
  MantineProvider
,createTheme
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.layer.css";
import "./App.css";
import AppContents from "./AppContents";



const theme = createTheme({
  fontFamily: "Open Sans, sans-serif",
  components: {
    UnstyledButton: {
      styles: {
        root: {
          overflow: "visible",
        },
      },
    },
  },
});

function App() {
 

  return (
    <>
      <MantineProvider theme={theme} >
        <BrowserRouter>
          <AppContents />
        </BrowserRouter>
      </MantineProvider>
    </>
  );
}

export default App;
