import { Route, Routes } from 'react-router'
import Layout from './components/layout/Layout.jsx'
import CreateEvent from './pages/CreateEvent.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/login.jsx'
import NotFound from './pages/NotFound.jsx'
import Signup from './pages/signup.jsx'
import SearchEvents from './pages/SearchEvents.jsx'
import { ROUTES } from './routes.js'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path={ROUTES.search} element={<SearchEvents />} />
        <Route path={ROUTES.createEvent} element={<CreateEvent />} />
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.signup} element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
