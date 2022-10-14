import { createRoot } from 'react-dom/client';
import App from './App';
import {ContextProvider} from "./context/Context";
import React from 'react';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ContextProvider>
      <App/>
    </ContextProvider>
  </React.StrictMode>);

