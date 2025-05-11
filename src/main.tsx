import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router';

import Map from './components/map/Map';
import LocationPage from './components/pages/Location';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename='/tRacket-dashboard-react'>
      <Routes>
        <Route path='/' element={<Map />} />
        <Route path='/location/:id' element={<LocationPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
