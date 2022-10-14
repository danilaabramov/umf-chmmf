import { createContext, useReducer } from "react";
import Reducer from "./Reducer";

const INITIAL_STATE = {
  pns: []
};

export const Context = createContext(INITIAL_STATE);


export const ContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(Reducer, INITIAL_STATE);


  return (
    <Context.Provider
      value={{
        pns: state.pns,
        dispatch
      }}>
      {children}
    </Context.Provider>
  );
};
