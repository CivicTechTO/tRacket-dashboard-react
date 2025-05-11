import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { Routes, Route, HashRouter } from 'react-router';

import Map from './components/map/Map';
import LocationPage from './components/pages/Location';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path='/' element={<Map />} />
        <Route path='/location/:id' element={<LocationPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
