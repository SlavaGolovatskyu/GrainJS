import { hydrate } from 'grainlet';
import { AsyncApp } from './AsyncApp.jsx';

hydrate(AsyncApp, document.getElementById('app'));
