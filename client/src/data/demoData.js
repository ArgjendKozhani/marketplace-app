export const demoCategories = [
  { id: 'cars', label: 'Cars', icon: '🚗', color: '#ef5b31' },
  { id: 'real-estate', label: 'Real Estate', icon: '🏠', color: '#1f7a8c' },
  { id: 'electronics', label: 'Electronics', icon: '💻', color: '#2364aa' },
  { id: 'jobs', label: 'Jobs', icon: '💼', color: '#7a4ce0' },
  { id: 'furniture', label: 'Furniture', icon: '🪑', color: '#7b5e57' },
  { id: 'services', label: 'Services', icon: '🛠️', color: '#2a9d8f' }
];

export const demoListings = [
  {
    id: 'listing-1',
    title: 'Audi A4 2.0 TDI, 2017',
    category: 'cars',
    price: 14900,
    currency: 'EUR',
    location: 'Prishtine',
    condition: 'Used',
    sellerType: 'Business',
    featured: true,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
    description: 'Clean condition, imported from Switzerland, full service history and automatic gearbox.',
    postedAt: '2026-03-10T09:30:00.000Z'
  },
  {
    id: 'listing-2',
    title: 'Modern apartment for rent, 2 bedrooms',
    category: 'real-estate',
    price: 420,
    currency: 'EUR',
    location: 'Prizren',
    condition: 'Renovated',
    sellerType: 'Owner',
    featured: true,
    image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=900&q=80',
    description: 'Bright apartment near the city center with parking spot and balcony.',
    postedAt: '2026-03-09T12:10:00.000Z'
  },
  {
    id: 'listing-3',
    title: 'MacBook Air M2 13-inch',
    category: 'electronics',
    price: 980,
    currency: 'EUR',
    location: 'Gjilan',
    condition: 'Like new',
    sellerType: 'Individual',
    featured: false,
    image: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    description: '16GB RAM, 512GB SSD, battery health excellent, charger included.',
    postedAt: '2026-03-11T15:15:00.000Z'
  },
  {
    id: 'listing-4',
    title: 'Hiring frontend developer',
    category: 'jobs',
    price: 1400,
    currency: 'EUR',
    location: 'Prishtine',
    condition: 'Full-time',
    sellerType: 'Business',
    featured: false,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    description: 'React position for a product team working on marketplace and booking flows.',
    postedAt: '2026-03-12T08:00:00.000Z'
  },
  {
    id: 'listing-5',
    title: 'Dining table with 6 chairs',
    category: 'furniture',
    price: 260,
    currency: 'EUR',
    location: 'Peje',
    condition: 'Used',
    sellerType: 'Individual',
    featured: true,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description: 'Solid wood set in good condition, ideal for family dining room.',
    postedAt: '2026-03-07T18:45:00.000Z'
  },
  {
    id: 'listing-6',
    title: 'Home cleaning service weekly',
    category: 'services',
    price: 35,
    currency: 'EUR',
    location: 'Ferizaj',
    condition: 'Available',
    sellerType: 'Business',
    featured: false,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    description: 'Weekly or one-time home cleaning service for apartments and offices.',
    postedAt: '2026-03-08T11:20:00.000Z'
  }
];
