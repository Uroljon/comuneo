import { createSlice } from "@reduxjs/toolkit";

const data = createSlice({
  name: "loaded",
  initialState: {
    isLoaded: false,
    extractedData: null,
    fileName: null,
    processedAt: null
  },
  reducers: {
    setExtractedData: (state, action) => {
      state.isLoaded = true;
      state.extractedData = action.payload.data;
      state.fileName = action.payload.fileName;
      state.processedAt = action.payload.processedAt || new Date().toISOString();
    },
    resetData: (state) => {
      state.isLoaded = false;
      state.extractedData = null;
      state.fileName = null;
      state.processedAt = null;
    }
  }
})

export const { setExtractedData, resetData } = data.actions

export default data.reducer