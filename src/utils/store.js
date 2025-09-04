import { configureStore } from "@reduxjs/toolkit";
import data from "./data";


const myStore = configureStore({
  reducer:{
    isLoaded:data
  }
})

export default myStore