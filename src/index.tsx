#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

// Render the app with patchConsole disabled to reduce flashing
render(<App />, {
  patchConsole: false,
});
