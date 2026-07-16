import { render, setNavigateBasename } from 'grainlet';
import { App } from './App.jsx';
import './styles/globals.css';

setNavigateBasename('/zenwayro');
render(App, document.getElementById('app'));
