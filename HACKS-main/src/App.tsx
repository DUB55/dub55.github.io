import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { FileExplorer } from './components/FileExplorer';
import { FileViewer } from './components/FileViewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explorer/:repoName/*" element={<FileExplorer />} />
          <Route path="file/:repoName/*" element={<FileViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;