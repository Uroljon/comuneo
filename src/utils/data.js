import { createSlice } from "@reduxjs/toolkit";

const data= createSlice({
  name:"loaded",
  initialState:{
    name:false,

  },
  reducers:{
    getTheData:(state, action)=>{
      state.name= action.payload
    }
  }
})

export const{getTheData} =data.actions

export default data.reducer