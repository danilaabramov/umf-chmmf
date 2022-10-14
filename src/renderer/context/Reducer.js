const Reducer = (state, action) => {
  switch (action.type) {
    case "P_UPDATE":
      return {
        pns: action.payload,
      };
    default:
      return state;
  }
};

export default Reducer;
