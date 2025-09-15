import { useRef, useState } from "react";
import "../style/ai.css";
import { useDispatch } from "react-redux";
import { setExtractedData } from "../utils/data";
import { useNavigate } from "react-router-dom";
import Aside from "../component/Aside";
import regensburgData from "../data/regensburg.json";
import muehlheimData from "../data/muehlheim.json";

function Ai() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const input = useRef();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const inputFile = input.current.files[0];
    if (!inputFile) {
      alert("Please select a file to upload");
      return;
    }

    // Start loading animation
    setIsLoading(true);

    // Simulate processing time (5-8 seconds for demo)
    const processingTime = 5000 + Math.random() * 3000;

    setTimeout(() => {
      // Check filename to determine which data to use
      const fileName = inputFile.name.toLowerCase();
      let mockData;

      if (fileName.includes('muehlheim')) {
        mockData = muehlheimData;
      } else {
        // Default fallback to regensburg for any other file
        mockData = regensburgData;
      }

      // Store the extracted data in Redux
      dispatch(setExtractedData({
        data: mockData,
        fileName: inputFile.name,
        processedAt: new Date().toISOString()
      }));

      // Navigate to results page
      navigate("/result");
    }, processingTime);
  }

  return (
    <div className="layout">
      <Aside />
      <main>
        {isLoading && (
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
            <h1>Let AI Analyze Your File</h1>
            <h4>Upload your document and we’ll automatically generate structured action fields, projects, and indicators for you.</h4>
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
