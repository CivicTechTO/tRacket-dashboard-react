import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Map from './components/map/Map'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Map/>
  </StrictMode>,
)
