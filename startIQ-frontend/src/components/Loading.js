import React from "react";

const Loading = () => (
  <div className="wrapper-loading" id="loading">
    <div className="text-center mt-5">
      {/* <img src={Spinner} className="spinner"/> */}
      <div className="spinner-border text-danger spinner" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    
    </div>
  </div>
);

export default Loading;