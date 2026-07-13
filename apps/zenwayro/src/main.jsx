import { render } from '../../../index.js';
import { setNavigateBasename } from '../../../route/navigate/navigate.js';
import { App } from './App.jsx';
import './styles/globals.css';

setNavigateBasename('/zenwayro');
render(App, document.getElementById('app'));
