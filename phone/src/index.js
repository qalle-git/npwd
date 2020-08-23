import '@babel/polyfill';

import React from "react";
import ReactDOM from "react-dom";
import "./main.css";
import Phone from "./Phone";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

ReactDOM.render(
  <BrowserRouter>
    <RecoilRoot>
      <Phone />
    </RecoilRoot>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();