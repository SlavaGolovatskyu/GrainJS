import { hydrate } from 'grain';
import { CounterApp } from './CounterApp.jsx';

hydrate(CounterApp, document.getElementById('app'));
