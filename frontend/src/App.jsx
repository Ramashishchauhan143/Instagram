import { useCallback, useEffect, useState } from 'react';

const TOKEN_KEY = 'instagram_token';

const iconPaths = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /><path d="M9 21v-7h6v7" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  explore: <><circle cx="12" cy="12" r="9" /><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2z" /></>,
  heart: <path d="M20.8 8.8c0 4.5-8.8 10-8.8 10S3.2 13.3 3.2 8.8a4.8 4.8 0 0 1 8.8-2.5 4.8 4.8 0 0 1 8.8 2.5Z" />,
  comment: <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-3.5-.8L4 20l1.1-3.7A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 3.1 8 7Z" />,
  send: <><path d="m21 3-7.2 18-3.3-7.5L3 10.2z" /><path d="M10.5 13.5 21 3" /></>,
  bookmark: <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z" />,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  camera: <><path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="4" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>
};

function Icon({ name, filled = false, size = 24, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  );
}

function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Something went wrong. Please try again.');
  return body;
}

function Avatar({ user, size = 'normal' }) {
  const name = user?.username || 'user';
  return (
    <span className={`avatar avatar-${size}`} aria-label={`${name}'s profile`}>
      {user?.profilePicture
        ? <img src={user.profilePicture} alt="" />
        : <span>{name.charAt(0).toUpperCase()}</span>}
    </span>
  );
}

function Brand({ compact = false }) {
  return <span className={`brand ${compact ? 'brand-compact' : ''}`}>Instagram</span>;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = mode === 'register'
        ? { username: form.username.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };
      const result = await request(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      window.localStorage.setItem(TOKEN_KEY, result.token);
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <div className="auth-art" aria-hidden="true">
        <div className="art-glow art-glow-one" />
        <div className="art-glow art-glow-two" />
        <div className="art-window">
          <div className="art-bar"><span /><span /><span /><i>instagram</i></div>
          <div className="art-photo"><span className="sun" /><span className="mountain mountain-back" /><span className="mountain mountain-front" /><span className="art-caption">moments worth keeping</span></div>
          <div className="art-actions"><i /><i /><i /></div>
          <div className="art-dots"><b /><b /><b /><b /><b /></div>
        </div>
        <span className="art-note art-note-top">✦ share your little joys</span>
        <span className="art-note art-note-bottom">made for your moments</span>
      </div>

      <section className="auth-column">
        <div className="auth-card">
          <Brand />
          <p className="auth-subtitle">
            {mode === 'login' ? 'A little world, just for your moments.' : 'Join your friends and share what you love.'}
          </p>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <label className="field">
                <span>Username</span>
                <input
                  autoComplete="username"
                  required
                  minLength="3"
                  maxLength="30"
                  value={form.username}
                  onChange={(event) => setForm({ ...form, username: event.target.value })}
                  placeholder="Choose a username"
                />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input
                autoComplete="email"
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                type="password"
                minLength="8"
                required
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="At least 8 characters"
              />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button auth-submit" disabled={busy} type="submit">
              {busy ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
          <div className="auth-divider"><span /><i>OR</i><span /></div>
          <p className="auth-footnote">
            {mode === 'login' ? 'New to Instagram?' : 'Already have an account?'}{' '}
            <button className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Create account' : 'Log in'}
            </button>
          </p>
        </div>
        <p className="auth-legal">A quieter corner of the internet. Share what matters.</p>
      </section>
    </main>
  );
}

function PostCard({ post, currentUser, onChange }) {
  const [comment, setComment] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const liked = post.likes?.some((user) => (user._id || user) === currentUser?._id);
  const ownsPost = post.user?._id === currentUser?._id;

  async function toggleLike() {
    setBusy(true);
    setError('');
    try {
      await request(`/api/posts/${post._id}/${liked ? 'unlike' : 'like'}`, { method: 'POST' });
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function addComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    setBusy(true);
    setError('');
    try {
      await request(`/api/posts/${post._id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: comment.trim() })
      });
      setComment('');
      setCommentsOpen(true);
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deletePost() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setBusy(true);
    setError('');
    try {
      await request(`/api/posts/${post._id}`, { method: 'DELETE' });
      onChange();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function deleteComment(commentId) {
    setError('');
    try {
      await request(`/api/comments/${commentId}`, { method: 'DELETE' });
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <article className="post-card">
      <header className="post-header">
        <Avatar user={post.user} size="small" />
        <div className="post-byline">
          <strong>{post.user?.username || 'instagrammer'}</strong>
          <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
        {ownsPost && (
          <button className="icon-button post-menu" title="Delete post" aria-label="Delete post" disabled={busy} onClick={deletePost}>
            <Icon name="more" />
          </button>
        )}
      </header>

      <div className="post-image-wrap">
        <img className="post-image" src={post.image} alt={post.caption || `Photo by ${post.user?.username || 'a user'}`} loading="lazy" />
      </div>

      <div className="post-content">
        <div className="post-actions">
          <button className={`icon-button ${liked ? 'liked' : ''}`} onClick={toggleLike} disabled={busy} title={liked ? 'Unlike' : 'Like'} aria-label={liked ? 'Unlike post' : 'Like post'}>
            <Icon name="heart" filled={liked} />
          </button>
          <button className="icon-button" onClick={() => setCommentsOpen(!commentsOpen)} title="Comments" aria-label="View comments">
            <Icon name="comment" />
          </button>
          <button className="icon-button" onClick={() => navigator.clipboard?.writeText(window.location.href)} title="Copy page link" aria-label="Copy page link">
            <Icon name="send" />
          </button>
          <span className="action-spacer" />
          <span className="post-time">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
        </div>

        <strong className="like-count">{post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}</strong>
        {post.caption && <p className="post-caption"><strong>{post.user?.username}</strong> {post.caption}</p>}
        {!!post.comments?.length && (
          <button className="view-comments" onClick={() => setCommentsOpen(!commentsOpen)}>
            {commentsOpen ? 'Hide comments' : `View all ${post.comments.length} comments`}
          </button>
        )}
        {commentsOpen && (
          <div className="comment-list">
            {post.comments?.map((item) => (
              <p className="comment-row" key={item._id}>
                <span><strong>{item.user?.username || 'user'}</strong> {item.text}</span>
                {item.user?._id === currentUser?._id && (
                  <button className="comment-delete" onClick={() => deleteComment(item._id)} aria-label="Delete your comment">×</button>
                )}
              </p>
            ))}
          </div>
        )}
        {error && <p className="inline-error" role="alert">{error}</p>}
        <form className="comment-form" onSubmit={addComment}>
          <input aria-label="Add a comment" maxLength="1000" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment…" />
          <button disabled={!comment.trim() || busy} type="submit">Post</button>
        </form>
      </div>
    </article>
  );
}

function Composer({ onClose, onCreated }) {
  const [image, setImage] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await request('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ image: image.trim(), caption: caption.trim() })
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-card composer-modal" role="dialog" aria-modal="true" aria-labelledby="composer-title">
        <header className="modal-header">
          <button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          <h2 id="composer-title">Create a post</h2>
          <button className="text-button" disabled={!image.trim() || busy} onClick={submit}>Share</button>
        </header>
        <form className="composer-form" onSubmit={submit}>
          {image.trim() ? (
            <div className="composer-preview"><img src={image} alt="Post preview" onError={() => setError('That image could not be previewed. Check the image URL.')} /></div>
          ) : (
            <div className="composer-placeholder"><span className="camera-art"><Icon name="camera" size={44} /></span><strong>Let the moment speak</strong><span>Paste a public image URL to start.</span></div>
          )}
          <label className="field composer-field">
            <span>Photo URL</span>
            <input autoFocus type="url" required value={image} onChange={(event) => { setImage(event.target.value); setError(''); }} placeholder="https://example.com/your-photo.jpg" />
          </label>
          <label className="field composer-field">
            <span>Caption</span>
            <textarea maxLength="2200" rows="3" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Write a caption…" />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button composer-submit" disabled={!image.trim() || busy} type="submit">
            {busy ? 'Sharing…' : 'Share post'}
          </button>
        </form>
      </section>
    </div>
  );
}

function ProfileModal({ user, onClose, onUpdated, onLogout }) {
  const [bio, setBio] = useState(user.bio || '');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await request('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ bio, profilePicture })
      });
      onUpdated(result.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-card profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <header className="modal-header">
          <button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          <h2 id="profile-title">Your profile</h2>
          <span className="modal-header-spacer" />
        </header>
        <div className="profile-summary">
          <Avatar user={{ ...user, profilePicture }} size="large" />
          <div><strong>{user.username}</strong><span>{user.email}</span></div>
        </div>
        <div className="profile-stats">
          <span><strong>{user.followers?.length || 0}</strong> followers</span>
          <span><strong>{user.following?.length || 0}</strong> following</span>
        </div>
        <form className="profile-form" onSubmit={submit}>
          <label className="field">
            <span>Profile photo URL</span>
            <input type="url" value={profilePicture} onChange={(event) => setProfilePicture(event.target.value)} placeholder="https://example.com/avatar.jpg" />
          </label>
          <label className="field">
            <span>Bio</span>
            <textarea maxLength="500" rows="3" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="A little about you…" />
            <small>{bio.length}/500</small>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save profile'}</button>
        </form>
        <button className="logout-button" onClick={onLogout}><Icon name="logout" size={18} /> Log out</button>
      </section>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    setFeedError('');
    try {
      const result = await request('/api/posts');
      setPosts(result.posts);
    } catch (err) {
      setFeedError(err.message);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      setAuthReady(true);
      return () => { active = false; };
    }

    request('/api/auth/me')
      .then((result) => { if (active) setUser(result.user); })
      .catch(() => { if (active) window.localStorage.removeItem(TOKEN_KEY); })
      .finally(() => { if (active) setAuthReady(true); });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (user) loadPosts();
  }, [user, loadPosts]);

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setPosts([]);
    setProfileOpen(false);
  }

  if (!authReady) {
    return <main className="loading-screen"><span className="loading-mark">i</span><span className="loading-dots">Loading your little corner…</span></main>;
  }

  if (!user) return <AuthScreen onAuthenticated={setUser} />;

  const filteredPosts = posts.filter((post) => {
    const text = `${post.user?.username || ''} ${post.caption || ''}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><Brand /><Brand compact /></div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <button className="nav-item active" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }}>
            <Icon name="home" /><span>Home</span>
          </button>
          <button className="nav-item" onClick={() => document.querySelector('.search-input')?.focus()}>
            <Icon name="search" /><span>Search posts</span>
          </button>
          <button className="nav-item" onClick={loadPosts}>
            <Icon name="explore" /><span>Explore</span>
          </button>
          <button className="nav-item" onClick={() => setComposerOpen(true)}>
            <Icon name="plus" /><span>Create</span>
          </button>
          <button className="nav-item" onClick={() => setProfileOpen(true)}>
            <Avatar user={user} size="nav" /><span>Profile</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><span className="note-sparkle">✳</span><span>Make today<br />a little more you.</span></div>
          <button className="sidebar-account" onClick={() => setProfileOpen(true)}>
            <Avatar user={user} size="small" />
            <span className="sidebar-account-text"><strong>{user.username}</strong><span>Your profile</span></span>
            <Icon name="more" size={18} />
          </button>
        </div>
      </aside>

      {mobileMenuOpen && <button className="mobile-dismiss" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}

      <header className="mobile-header">
        <button className="icon-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation"><Icon name="grid" /></button>
        <Brand />
        <button className="icon-button" onClick={() => setProfileOpen(true)} aria-label="Your profile"><Avatar user={user} size="nav" /></button>
      </header>

      <main className="main-area">
        <section className="feed-column">
          <div className="feed-heading">
            <div>
              <span className="eyebrow">YOUR PEOPLE, YOUR PERSPECTIVE</span>
              <h1>Your feed<span className="heading-sparkle">✳</span></h1>
            </div>
            <label className="search-box">
              <Icon name="search" size={19} />
              <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a moment…" aria-label="Search posts" />
              {query && <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search"><Icon name="close" size={16} /></button>}
            </label>
          </div>

          <div className="feed-banner">
            <div className="banner-copy"><span>✦ &nbsp;A LITTLE INSPIRATION</span><strong>Every photo tells<br />a whole little story.</strong><button onClick={() => setComposerOpen(true)}>Share yours <span>↗</span></button></div>
            <div className="banner-art" aria-hidden="true"><div className="banner-orb" /><div className="banner-leaf leaf-one" /><div className="banner-leaf leaf-two" /><div className="banner-leaf leaf-three" /><div className="banner-flower">✳</div><span className="banner-sticker">hello,<br />beautiful <i>✷</i></span></div>
          </div>

          {feedError && <div className="feed-alert" role="alert"><span>{feedError}</span><button onClick={loadPosts}>Try again</button></div>}
          {loadingPosts && posts.length === 0 && <div className="feed-loading"><span className="spinner" />Finding your moments…</div>}
          {!loadingPosts && !feedError && filteredPosts.length === 0 && (
            <section className="empty-feed">
              <div className="empty-icon"><Icon name={query ? 'search' : 'camera'} size={31} /></div>
              <span className="eyebrow">{query ? 'NO MATCHES THIS TIME' : 'A FRESH LITTLE START'}</span>
              <h2>{query ? 'No moments found.' : 'Your feed is a blank canvas.'}</h2>
              <p>{query ? 'Try searching for another name or caption.' : 'Share a photo to get things going. Your next favorite memory starts here.'}</p>
              {!query && <button className="primary-button empty-create" onClick={() => setComposerOpen(true)}><Icon name="plus" size={19} /> Create your first post</button>}
            </section>
          )}
          <div className="post-list">
            {filteredPosts.map((post) => <PostCard key={post._id} post={post} currentUser={user} onChange={loadPosts} />)}
          </div>
          {posts.length > 0 && <p className="feed-end"><span>✳</span> You’re all caught up</p>}
        </section>

        <aside className="right-rail">
          <button className="self-profile" onClick={() => setProfileOpen(true)}>
            <Avatar user={user} size="large" />
            <span><strong>{user.username}</strong><span>{user.bio || 'Good to see you here.'}</span></span>
            <Icon name="more" size={20} />
          </button>
          <div className="rail-divider" />
          <section className="rail-suggestion">
            <div className="rail-title"><span>YOUR LITTLE CORNER</span><span className="rail-asterisk">✳</span></div>
            <div className="rail-artwork"><span className="rail-sun" /><span className="rail-wave wave-one" /><span className="rail-wave wave-two" /><span className="rail-star">✦</span><span className="rail-star rail-star-two">✳</span><span className="rail-art-caption">stay awhile</span></div>
            <h3>Good things happen when we share.</h3>
            <p>Post a moment, leave a little love, and make someone’s day.</p>
            <button className="rail-create" onClick={() => setComposerOpen(true)}><Icon name="plus" size={17} /> Create a post</button>
          </section>
          <div className="rail-footer">A place for the moments that make you, you.<br /><span>MADE WITH A LITTLE HEART &nbsp;♥</span></div>
        </aside>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button aria-label="Home" className="mobile-nav-active"><Icon name="home" /></button>
        <button aria-label="Search posts" onClick={() => document.querySelector('.search-input')?.focus()}><Icon name="search" /></button>
        <button aria-label="Create post" onClick={() => setComposerOpen(true)}><Icon name="plus" /></button>
        <button aria-label="Explore" onClick={loadPosts}><Icon name="explore" /></button>
        <button aria-label="Profile" onClick={() => setProfileOpen(true)}><Avatar user={user} size="nav" /></button>
      </nav>

      {composerOpen && <Composer onClose={() => setComposerOpen(false)} onCreated={loadPosts} />}
      {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onUpdated={setUser} onLogout={logout} />}
    </div>
  );
}

export default App;
