import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import AppoloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

import { URI } from "./config";

const client = new AppoloClient({
  uri: URI
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
