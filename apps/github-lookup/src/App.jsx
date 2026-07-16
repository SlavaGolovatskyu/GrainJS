import { createSignal, Show } from 'grainlet';

async function fetchGithubUser(username) {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (res.status === 404) {
    throw new Error(`No GitHub user named “${username}”.`);
  }
  if (res.status === 403) {
    throw new Error('GitHub rate limit hit. Try again in a minute.');
  }
  if (!res.ok) {
    throw new Error(`GitHub returned ${res.status}. Please try again.`);
  }

  return res.json();
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatCount(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat().format(n);
}

export function App() {
  const [query, setQuery] = createSignal('');
  const [user, setUser] = createSignal(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [searched, setSearched] = createSignal(false);

  const lookup = async (event) => {
    event?.preventDefault?.();
    const form = event?.currentTarget;
    const fromForm =
      form instanceof HTMLFormElement
        ? String(new FormData(form).get('username') || '')
        : '';
    const username = (fromForm || query()).trim().replace(/^@/, '');
    if (fromForm) setQuery(fromForm);

    if (!username) {
      setError('Enter a GitHub username.');
      setUser(null);
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const data = await fetchGithubUser(username);
      setUser(data);
    } catch (err) {
      setUser(null);
      setError(err?.message || 'Could not load that profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="shell">
      <header class="hero">
        <p class="hero__eyebrow">Public GitHub API</p>
        <h1 class="hero__title">
          Find anyone’s <em>GitHub</em> story
        </h1>
        <p class="hero__lead">
          Type a username to pull avatar, bio, stats, and profile links — no login required.
        </p>
      </header>

      <form class="search" onSubmit={lookup}>
        <input
          class="search__input"
          type="search"
          name="username"
          autocomplete="username"
          placeholder="e.g. octocat"
          value={query()}
          onInput={(e) => setQuery(e.target.value)}
          aria-label="GitHub username"
        />
        <button class="search__button" type="submit" disabled={loading()}>
          {loading() ? 'Searching…' : 'Look up'}
        </button>
      </form>

      <Show when={error()}>
        <p class="status status--error" role="alert">
          {error()}
        </p>
      </Show>

      <Show when={loading()}>
        <p class="status">Fetching profile from GitHub…</p>
      </Show>

      <Show when={!loading() && !error() && !user() && !searched()}>
        <div class="empty">Search a username to see their public profile.</div>
      </Show>

      <Show when={!loading() && user()}>
        {() => {
          const u = user();
          return (
            <article class="profile">
              <div class="profile__top">
                <img
                  class="profile__avatar"
                  src={u.avatar_url}
                  alt={`${u.login} avatar`}
                  width="88"
                  height="88"
                />
                <div class="profile__identity">
                  <h2 class="profile__name">{u.name || u.login}</h2>
                  <p class="profile__login">@{u.login}</p>
                  <Show when={u.bio}>
                    <p class="profile__bio">{u.bio}</p>
                  </Show>
                  <ul class="profile__meta">
                    <Show when={u.company}>
                      <li>{u.company}</li>
                    </Show>
                    <Show when={u.location}>
                      <li>{u.location}</li>
                    </Show>
                    <Show when={u.blog}>
                      <li>
                        <a href={/^https?:\/\//.test(u.blog) ? u.blog : `https://${u.blog}`} target="_blank" rel="noreferrer">
                          {u.blog}
                        </a>
                      </li>
                    </Show>
                    <Show when={u.created_at}>
                      <li>Joined {formatDate(u.created_at)}</li>
                    </Show>
                  </ul>
                </div>
              </div>

              <div class="stats" aria-label="Profile stats">
                <div class="stat">
                  <span class="stat__value">{formatCount(u.public_repos)}</span>
                  <span class="stat__label">Repos</span>
                </div>
                <div class="stat">
                  <span class="stat__value">{formatCount(u.followers)}</span>
                  <span class="stat__label">Followers</span>
                </div>
                <div class="stat">
                  <span class="stat__value">{formatCount(u.following)}</span>
                  <span class="stat__label">Following</span>
                </div>
              </div>

              <div class="profile__actions">
                <a class="profile__link" href={u.html_url} target="_blank" rel="noreferrer">
                  Open on GitHub
                </a>
                <Show when={u.twitter_username}>
                  <a
                    class="profile__link"
                    href={`https://x.com/${u.twitter_username}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    @{u.twitter_username}
                  </a>
                </Show>
              </div>
            </article>
          );
        }}
      </Show>
    </div>
  );
}
