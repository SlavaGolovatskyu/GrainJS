import { render } from 'grainlet';
import { setNavigateBasename } from 'grainlet/route';
import { App } from './App.jsx';
import './styles/globals.css';

setNavigateBasename('/zenwayro');
render(App, document.getElementById('app'));
