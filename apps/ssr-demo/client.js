import { hydrate } from 'grainlet';
import { CounterApp } from './CounterApp.jsx';

hydrate(CounterApp, document.getElementById('app'));
