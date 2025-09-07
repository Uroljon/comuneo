import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorPage from './page/ErrorPage.jsx'
import HomePage from './page/HomePage.jsx'
import Ai from './page/Ai.jsx'
import { Provider } from 'react-redux'
import myStore from './utils/store.js'
import ResultPgae from './page/ResultPgae.jsx'

const myRouter = createBrowserRouter([{
  element:<App />,
  path:"/",
  errorElement:<ErrorPage />,
  children:[
    {
      path:"/",
      element:<HomePage />
    },
   
    {
      path:"/ai",
      element:<Ai />
    },
    {
      path:'/result',
      element:<ResultPgae />
    }
  ]
}])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={myStore}>
   <RouterProvider router={myRouter} />

    </Provider>
  </StrictMode>,
)
