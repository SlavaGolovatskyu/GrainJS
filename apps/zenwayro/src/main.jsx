import { render, setNavigateBasename } from 'grain';
import { App } from './App.jsx';
import './styles/globals.css';

setNavigateBasename('/zenwayro');
render(App, document.getElementById('app'));
