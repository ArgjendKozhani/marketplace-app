import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import AuthPanel from './components/AuthPanel';
import ListingCard from './components/ListingCard';
import SellForm from './components/SellForm';

const defaultFilters = {
  search: '',
  category: 'all',
  location: 'all',
  condition: 'all',
  minPrice: '',
  maxPrice: '',
  sort: 'newest'
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

function getApiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({ locations: [], conditions: [], total: 0 });
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('register');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [showScrollToEndButton, setShowScrollToEndButton] = useState(false);
  const [openSellAfterAuth, setOpenSellAfterAuth] = useState(false);
  const [loginEmailPrefill, setLoginEmailPrefill] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    const savedToken = window.localStorage.getItem('marketplace-token');
    const savedUser = window.localStorage.getItem('marketplace-user');

    if (savedToken) {
      setAuthToken(savedToken);
    }

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetch(getApiUrl('/api/categories'));

      if (!response.ok) {
        throw new Error('Could not load categories.');
      }

      const data = await response.json();
      setCategories(data);
    }

    fetchCategories().catch((error) => {
      setErrorMessage(error.message);
    });
  }, []);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    async function fetchCurrentUser() {
      const response = await fetch(getApiUrl('/api/auth/me'), {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Your session expired. Please log in again.');
      }

      const data = await response.json();
      setCurrentUser(data.user);
      window.localStorage.setItem('marketplace-user', JSON.stringify(data.user));
    }

    fetchCurrentUser().catch((error) => {
      setAuthError(error.message);
      setAuthToken('');
      setCurrentUser(null);
      setAuthMode('login');
      window.localStorage.removeItem('marketplace-token');
      window.localStorage.removeItem('marketplace-user');
    });
  }, [authToken]);

  useEffect(() => {
    if (isAuthModalOpen || isSellModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen, isSellModalOpen]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let hideTimer;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      const nearBottom = window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 140;

      if (isAuthModalOpen || isSellModalOpen || nearBottom || currentScrollY < 260) {
        setShowScrollToEndButton(false);
      } else if (scrollDelta > 120) {
        setShowScrollToEndButton(true);
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => {
          setShowScrollToEndButton(false);
        }, 1600);
      } else if (scrollDelta < -24) {
        setShowScrollToEndButton(false);
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(hideTimer);
    };
  }, [isAuthModalOpen, isSellModalOpen]);

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      setErrorMessage('');

      const params = new URLSearchParams({
        search: deferredSearch,
        category: filters.category,
        location: filters.location,
        condition: filters.condition,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort
      });

      const response = await fetch(getApiUrl(`/api/listings?${params.toString()}`));

      if (!response.ok) {
        throw new Error('Could not load listings.');
      }

      const data = await response.json();

      setListings(data.items);
      setMeta(data.meta);
      setSelectedListing((current) => data.items.find((item) => item.id === current?.id) || data.items[0] || null);
      setIsLoading(false);
    }

    fetchListings().catch(() => {
      setErrorMessage('Could not load listings. Make sure the API server is running.');
      setIsLoading(false);
    });
  }, [deferredSearch, filters.category, filters.location, filters.condition, filters.minPrice, filters.maxPrice, filters.sort, refreshKey]);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category])),
    [categories]
  );

  const stats = useMemo(() => {
    const featuredCount = listings.filter((listing) => listing.featured).length;
    const totalValue = listings.reduce((sum, listing) => sum + Number(listing.price || 0), 0);

    return {
      totalListings: meta.total,
      featuredCount,
      totalValue
    };
  }, [listings, meta.total]);

  async function handleCreateListing(payload) {
    if (!authToken) {
      setErrorMessage('Please register or log in before publishing a listing.');
      setAuthMode('login');
      setIsAuthModalOpen(true);
      setOpenSellAfterAuth(true);
      return false;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(getApiUrl('/api/listings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not publish listing.');
      }

      setSuccessMessage('Listing published. Refresh the page later and it will still be there.');
      setRefreshKey((current) => current + 1);
      setIsSellModalOpen(false);
      return true;
    } catch (error) {
      setErrorMessage(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAuthSubmit(mode, payload) {
    setIsAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      const response = await fetch(getApiUrl(`/api/auth/${mode}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      if (mode === 'register') {
        setAuthMessage('Registration successful. Now log in with your new account.');
        setAuthMode('login');
        setLoginEmailPrefill(payload.email || '');
        window.localStorage.removeItem('marketplace-token');
        window.localStorage.removeItem('marketplace-user');
      } else {
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setAuthMessage(data.message);
        setAuthMode('login');
        setLoginEmailPrefill(data.user.email);
        setIsAuthModalOpen(false);
        if (openSellAfterAuth) {
          setIsSellModalOpen(true);
          setOpenSellAfterAuth(false);
        }
        window.localStorage.setItem('marketplace-token', data.token);
        window.localStorage.setItem('marketplace-user', JSON.stringify(data.user));
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  }

  function handleLogout() {
    setAuthToken('');
    setCurrentUser(null);
    setAuthMessage('You have been logged out.');
    setAuthError('');
    setAuthMode('login');
    setIsAuthModalOpen(false);
    setIsSellModalOpen(false);
    setOpenSellAfterAuth(false);
    window.localStorage.removeItem('marketplace-token');
    window.localStorage.removeItem('marketplace-user');
  }

  function handleOpenSellModal() {
    if (!authToken) {
      setAuthMode('login');
      setAuthMessage('Log in first, then post your listing instantly.');
      setIsAuthModalOpen(true);
      setOpenSellAfterAuth(true);
      return;
    }

    setIsSellModalOpen(true);
  }

  return (
    <div className="page-shell">
      <nav className="navbar">
        <button className="brand-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="brand-dot" />
          Marketplace
        </button>

        <div className="navbar-actions">
          {currentUser ? (
            <button className="ghost-button" onClick={() => setIsAuthModalOpen(true)}>
              {currentUser.fullName}
            </button>
          ) : (
            <button
              className="ghost-button"
              onClick={() => {
                setAuthMode('register');
                setIsAuthModalOpen(true);
              }}
            >
              Register / Login
            </button>
          )}
          <button className="primary-button nav-cta" onClick={handleOpenSellModal}>
            + Post Listing
          </button>
        </div>
      </nav>

      <header className="topbar">
        <div>
          <h1>Shit. Blej. Gjej pune. Gjithcka ne nje vend.</h1>
        </div>
      </header>

      <AuthPanel
        currentUser={currentUser}
        authMessage={authMessage}
        authError={authError}
        authMode={authMode}
        isOpen={isAuthModalOpen}
        loginEmailPrefill={loginEmailPrefill}
        isAuthLoading={isAuthLoading}
        onClose={() => setIsAuthModalOpen(false)}
        onModeChange={setAuthMode}
        onRegister={(payload) => handleAuthSubmit('register', payload)}
        onLogin={(payload) => handleAuthSubmit('login', payload)}
        onLogout={handleLogout}
      />

      {isSellModalOpen ? (
        <div
          className="sell-modal-backdrop"
          onClick={() => {
            setIsSellModalOpen(false);
          }}
        >
          <section
            className="sell-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <button type="button" className="auth-close" onClick={() => setIsSellModalOpen(false)} aria-label="Close post listing dialog">
              ×
            </button>
            <div className="sell-copy">
              <span className="eyebrow">Seller flow</span>
              <h3>Post a new ad in seconds</h3>
              <p>Fill in your listing details and publish instantly without leaving this page.</p>
            </div>
            <SellForm categories={categories} onSubmit={handleCreateListing} isSubmitting={isSubmitting} />
          </section>
        </div>
      ) : null}

      {showScrollToEndButton ? (
        <button
          type="button"
          className="scroll-to-end-button"
          onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
        >
          Go to end
        </button>
      ) : null}

      <main>
        <section className="hero-grid">
          <div className="hero-copy">
            <h2>Build a local marketplace people can actually browse, filter, and post into.</h2>
            <p className="hero-text">
              This demo combines a React frontend with an Express API to simulate a practical classifieds product for cars, homes, jobs, electronics, and services.
            </p>

            <div className="hero-search-card">
              <label>
                Search listings
                <input
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Search for Audi, apartment, laptop..."
                />
              </label>

              <div className="stats-row">
                <div>
                  <strong>{stats.totalListings}</strong>
                  <span>Active ads</span>
                </div>
                <div>
                  <strong>{stats.featuredCount}</strong>
                  <span>Featured now</span>
                </div>
                <div>
                  <strong>{formatCompactCurrency(stats.totalValue || 0)}</strong>
                  <span>Total market value</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="category-strip">
          {categories.map((category) => (
            <button
              key={category.id}
              className={filters.category === category.id ? 'category-chip active' : 'category-chip'}
              style={{ '--chip-color': category.color }}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  category: current.category === category.id ? 'all' : category.id
                }))
              }
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </section>

        <section className="content-grid">
          <aside className="filters-panel">
            <div className="panel-heading">
              <span>Filters</span>
              <button className="text-button" onClick={() => setFilters(defaultFilters)}>
                Reset
              </button>
            </div>

            <label>
              Sort by
              <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>

            <label>
              Location
              <select value={filters.location} onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))}>
                <option value="all">All locations</option>
                {meta.locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Condition
              <select value={filters.condition} onChange={(event) => setFilters((current) => ({ ...current, condition: event.target.value }))}>
                <option value="all">All conditions</option>
                {meta.conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Min price
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))}
                placeholder="0"
              />
            </label>

            <label>
              Max price
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))}
                placeholder="10000"
              />
            </label>
          </aside>

          <section className="listing-column">
            <div className="section-header">
              <div>
                <span className="eyebrow">Explore listings</span>
                <h3>{meta.total} results</h3>
              </div>
              {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
            </div>

            {successMessage ? <p className="success-text">{successMessage}</p> : null}

            {isLoading ? <div className="empty-state">Loading listings...</div> : null}

            {!isLoading && listings.length === 0 ? (
              <div className="empty-state">No listings match your filters yet.</div>
            ) : null}

            <div className="listing-grid">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  category={categoryMap[listing.category]}
                  onSelect={setSelectedListing}
                />
              ))}
            </div>
          </section>

          <aside className="detail-panel">
            {selectedListing ? (
              <>
                <div className="detail-image-wrap">
                  <img src={selectedListing.image} alt={selectedListing.title} className="detail-image" />
                  {selectedListing.featured ? <span className="featured-badge">⭐ Featured</span> : null}
                </div>

                <div className="detail-copy">
                  <div className="detail-header">
                    <span
                      className="category-pill"
                      style={{ '--pill-color': categoryMap[selectedListing.category]?.color || '#ef5b31' }}
                    >
                      {categoryMap[selectedListing.category]?.icon}{' '}
                      {categoryMap[selectedListing.category]?.label || selectedListing.category}
                    </span>
                    <span className="listing-date">
                      {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(selectedListing.postedAt))}
                    </span>
                  </div>

                  <h3>{selectedListing.title}</h3>

                  <div className="detail-price">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: selectedListing.currency,
                      maximumFractionDigits: 0
                    }).format(selectedListing.price)}
                  </div>

                  <p>{selectedListing.description}</p>

                  <div className="detail-divider" />

                  <div className="detail-info-grid">
                    <div>
                      <span className="detail-label">Location</span>
                      <span className="detail-value">📍 {selectedListing.location}</span>
                    </div>
                    <div>
                      <span className="detail-label">Condition</span>
                      <span className="detail-value">{selectedListing.condition}</span>
                    </div>
                    <div>
                      <span className="detail-label">Seller type</span>
                      <span className="detail-value">{selectedListing.sellerType}</span>
                    </div>
                    <div>
                      <span className="detail-label">Listed on</span>
                      <span className="detail-value">
                        {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(selectedListing.postedAt))}
                      </span>
                    </div>
                  </div>

                  <div className="detail-divider" />

                  <div className="detail-seller">
                    <span className="detail-label">Posted by</span>
                    <div className="detail-seller-row">
                      <div className="seller-avatar">
                        {selectedListing.ownerName ? selectedListing.ownerName[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <strong>{selectedListing.ownerName || 'Anonymous Seller'}</strong>
                        <span className="muted-text">
                          {selectedListing.ownerEmail || 'No contact info available'}
                        </span>
                      </div>
                    </div>
                    {selectedListing.ownerEmail ? (
                      <a
                        className="detail-contact-btn"
                        href={`mailto:${selectedListing.ownerEmail}?subject=${encodeURIComponent('Inquiry: ' + selectedListing.title)}`}
                      >
                        ✉ Contact Seller
                      </a>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">Choose a listing to inspect the details.</div>
            )}
          </aside>
        </section>

      </main>
    </div>
  );
}
