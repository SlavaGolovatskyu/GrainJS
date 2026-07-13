import {
  createComponent,
  render,
  Router,
  Route,
  A,
  navigate,
  useParams,
  useLocation,
} from '../index.js';

const Home = createComponent(() => (
  <section class="page">
    <h2>Home</h2>
    <p>Welcome. This app uses History API routing with signals.</p>
    <button type="button" onclick={() => navigate('/users/3')}>
      Programmatic: go to User 3
    </button>
  </section>
));

const About = createComponent(() => (
  <section class="page">
    <h2>About</h2>
    <p>Route package: Router, Route, A, navigate, useParams, useLocation.</p>
  </section>
));

const User = createComponent(() => {
  const params = useParams();
  const location = useLocation();
  return (
    <section class="page">
      <h2>User {params().id}</h2>
      <p class="meta">pathname: {location().pathname}</p>
      <p>
        Try <A href="/users/1">/users/1</A>, <A href="/users/2">/users/2</A>, or{' '}
        <A href="/users/9">/users/9</A>.
      </p>
    </section>
  );
});

const NotFound = createComponent(() => (
  <section class="page">
    <h2>Not found</h2>
    <p>No route matched. <A href="/">Back home</A></p>
  </section>
));

const App = createComponent(() => (
  <div class="app">
    <nav class="nav">
      <A href="/" activeClass="active">
        Home
      </A>
      <A href="/about" activeClass="active">
        About
      </A>
      <A href="/users/1" activeClass="active">
        User 1
      </A>
      <A href="/does-not-exist" activeClass="active">
        404
      </A>
    </nav>
    <Router basename="/routing">
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users/:id" component={User} />
      <Route path="*" component={NotFound} />
    </Router>
  </div>
));

render(App, document.getElementById('app'));
