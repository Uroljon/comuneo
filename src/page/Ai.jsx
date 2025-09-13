import { useRef, useState } from "react";
import "../style/ai.css";
import { useDispatch } from "react-redux";
import { getTheData } from "../utils/data";
import { useNavigate } from "react-router-dom";
import Aside from "../component/Aside";

function Ai() {
  let dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(true);
  let input = useRef();
  let navigate  = useNavigate()
  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoaded(false);

    const inputFile = input.current.files[0];

    if (!inputFile) {
      console.log("No file received from input");
      return;
    }

    const formData = new FormData()
    formData.append('file', inputFile)

    let res = fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });
    if (res.status === 200) {
      // handle JSON
      console.log(res, "res test");

      fetch("http://127.0.0.1:8000/extract?source_id=20250907_121745_20655024_mulheim")
        .then(res => res.json())
        .then(data => console.log(data, "extracted"))

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
    <div className="layout">
      <Aside />
      <main>
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
      </main>
    </div>
  );
}

export default Ai;
