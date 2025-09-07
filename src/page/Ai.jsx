import { useRef, useState } from "react";
import "../style/ai.css";
import { useDispatch } from "react-redux";
import { getTheData } from "../utils/data";
import { useNavigate } from "react-router-dom";

function Ai() {
  let dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(true);
  let input = useRef();
  let navigate  = useNavigate()
  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoaded(false);


    // test environment
    let res = fetch("dfs.com", {
      headers: {
        "Contnet-type": "application/json",
      },
      body: JSON.stringify(input.value),
    });
    if (res.status === 200) {
      // handle JSON
      alert("hey !");
    } else {
      setTimeout(() => {
        setIsLoaded(true);
        console.log(isLoaded);

        dispatch(getTheData(isLoaded));
        navigate("/result")

      }, 5000);
    }
  }

  return (
    <>
      {!isLoaded && (
        <div className="loader">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <circle
              fill="#0d00ad"
              stroke="#0d00ad"
              strokeWidth="15"
              r="15"
              cx="40"
              cy="65"
            >
              <animate
                attributeName="cy"
                calcMode="spline"
                dur="2"
                values="65;135;65;"
                keySplines=".5 0 .5 1;.5 0 .5 1"
                repeatCount="indefinite"
                begin="-.4"
              ></animate>
            </circle>
            <circle
              fill="#0d00ad"
              stroke="#0d00ad"
              strokeWidth="15"
              r="15"
              cx="100"
              cy="65"
            >
              <animate
                attributeName="cy"
                calcMode="spline"
                dur="2"
                values="65;135;65;"
                keySplines=".5 0 .5 1;.5 0 .5 1"
                repeatCount="indefinite"
                begin="-.2"
              ></animate>
            </circle>
            <circle
              fill="#0d00ad"
              stroke="#0d00ad"
              strokeWidth="15"
              r="15"
              cx="160"
              cy="65"
            >
              <animate
                attributeName="cy"
                calcMode="spline"
                dur="2"
                values="65;135;65;"
                keySplines=".5 0 .5 1;.5 0 .5 1"
                repeatCount="indefinite"
                begin="0"
              ></animate>
            </circle>
          </svg>
          <span>File is being processed, it might take several minutes</span>
        </div>
      )}

      <div className="ai">
        <div className="container">
          <h4>Upload your PDF</h4>
          <h1>Comuneo AI</h1>
          <form onSubmit={(e) => handleSubmit(e)}>
            <input ref={input} type="file" multiple required />
            <button type="submit">Upload</button>
          </form>
        </div>
      </div>

    </>
  );
}

export default Ai;
