import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppProvider } from '@edx/frontend-platform/react';

import FooterSlot from '@openedx/frontend-slot-footer';
import Header from '@edx/frontend-component-header';

import store from 'data/store';
import GradebookPage from 'containers/GradebookPage';
import './App.scss';
import Head from './head/Head';

const App = () => (
  <AppProvider store={store}>
    <Head />
    <div>
      <Header />
<h1> TESTING GRADEBOOK IN PRO SERVER EDUCATING AI </h1>
      <main>
        <Routes>
          <Route
            path="/:courseId"
            element={<GradebookPage />}
          />
        </Routes>
      </main>
      <FooterSlot />
    </div>
  </AppProvider>
);

export default App;
