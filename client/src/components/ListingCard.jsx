function formatPrice(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short'
  }).format(new Date(dateString));
}

export default function ListingCard({ listing, category, onSelect }) {
  return (
    <article className="listing-card" onClick={() => onSelect(listing)}>
      <div className="listing-media">
        <img src={listing.image} alt={listing.title} />
        {listing.featured ? <span className="featured-badge">Featured</span> : null}
      </div>

      <div className="listing-content">
        <div className="listing-meta-row">
          <span className="category-pill" style={{ '--pill-color': category?.color || '#ef5b31' }}>
            {category?.icon} {category?.label || listing.category}
          </span>
          <span className="listing-date">{formatDate(listing.postedAt)}</span>
        </div>

        <h3>{listing.title}</h3>
        <p>{listing.description}</p>

        <div className="listing-footer">
          <div>
            <strong>{formatPrice(listing.price, listing.currency)}</strong>
            <span>
              {listing.location} · {listing.condition}
            </span>
          </div>
          <span className="seller-tag">{listing.sellerType}</span>
        </div>
      </div>
    </article>
  );
}
