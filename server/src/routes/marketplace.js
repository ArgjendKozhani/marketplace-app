import { Router } from 'express';
import { categories } from '../data/seed.js';
import { authenticateRequest } from '../utils/auth.js';
import { addListing, getListings } from '../utils/listingStore.js';

const router = Router();

function sortListings(items, sort) {
  const sorted = [...items];

  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  }
}

function filterListings(listings, query) {
  const {
    search = '',
    category = 'all',
    location = 'all',
    condition = 'all',
    minPrice,
    maxPrice,
    sort = 'newest'
  } = query;

  const searchTerm = search.trim().toLowerCase();

  const filtered = listings.filter((listing) => {
    const matchesSearch =
      !searchTerm ||
      listing.title.toLowerCase().includes(searchTerm) ||
      listing.description.toLowerCase().includes(searchTerm);

    const matchesCategory = category === 'all' || listing.category === category;
    const matchesLocation = location === 'all' || listing.location === location;
    const matchesCondition = condition === 'all' || listing.condition === condition;
    const matchesMinPrice = !minPrice || listing.price >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || listing.price <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesCondition &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  return sortListings(filtered, sort);
}

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'marketplace-api' });
});

router.get('/categories', (_req, res) => {
  res.json(categories);
});

router.get('/listings', async (req, res) => {
  const allListings = await getListings();
  const filtered = filterListings(allListings, req.query);
  const locations = [...new Set(allListings.map((listing) => listing.location))].sort();
  const conditions = [...new Set(allListings.map((listing) => listing.condition))].sort();

  res.json({
    items: filtered,
    meta: {
      total: filtered.length,
      locations,
      conditions
    }
  });
});

router.get('/listings/:id', async (req, res) => {
  const listing = (await getListings()).find((item) => item.id === req.params.id);

  if (!listing) {
    return res.status(404).json({ message: 'Listing not found.' });
  }

  return res.json(listing);
});

router.post('/listings', authenticateRequest, async (req, res) => {
  const { title, category, price, location, condition, description, sellerType } = req.body;

  if (!title || !category || !price || !location || !condition || !description || !sellerType) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (Number(price) <= 0) {
    return res.status(400).json({ message: 'Price must be greater than 0.' });
  }

  const listing = {
    id: `listing-${Date.now()}`,
    title: title.trim(),
    category,
    price: Number(price),
    currency: 'EUR',
    location: location.trim(),
    condition: condition.trim(),
    description: description.trim(),
    sellerType: sellerType.trim(),
    ownerId: req.user.sub,
    ownerName: req.user.fullName,
    ownerEmail: req.user.email,
    featured: false,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    postedAt: new Date().toISOString()
  };

  const createdListing = await addListing(listing);
  return res.status(201).json(createdListing);
});

export default router;
