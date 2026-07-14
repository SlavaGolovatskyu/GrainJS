import {
  render,
  Router,
  Route,
  Link,
  navigate,
  useParams,
  useLocation,
} from 'grain';

function Home() {
  return (
    <section class="page">
      <h2>Home</h2>
      <p>Welcome. This app uses History API routing with signals.</p>
      <button type="button" onclick={() => navigate('/users/3')}>
        Programmatic: go to User 3
      </button>
    </section>
  );
}

function About() {
  return (
    <section class="page">
      <h2>About</h2>
      <p>Route package: Router, Route, Link, navigate, useParams, useLocation.</p>
    </section>
  );
}

function User() {
  const params = useParams();
  const location = useLocation();
  return (
    <section class="page">
      <h2>User {params().id}</h2>
      <p class="meta">pathname: {location().pathname}</p>
      <p>
        Try <Link href="/users/1">/users/1</Link>, <Link href="/users/2">/users/2</Link>, or{' '}
        <Link href="/users/9">/users/9</Link>.
      </p>
    </section>
  );
}

function NotFound() {
  return (
    <section class="page">
      <h2>Not found</h2>
      <p>No route matched. <Link href="/">Back home</Link></p>
    </section>
  );
}

function App() {
  return (
    <div class="app">
      <nav class="nav">
        <Link href="/" activeClass="active">
          Home
        </Link>
        <Link href="/about" activeClass="active">
          About
        </Link>
        <Link href="/users/1" activeClass="active">
          User 1
        </Link>
        <Link href="/does-not-exist" activeClass="active">
          404
        </Link>
      </nav>
      <Router basename="/routing">
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/users/:id" component={User} />
        <Route path="*" component={NotFound} />
      </Router>
    </div>
  );
}

render(App, document.getElementById('app'));
