import { getPool } from '../db/database.js';
import { seedListings } from '../data/seed.js';

function mapListing(row) {
  return {
    id: `listing-${row.id}`,
    title: row.title,
    category: row.category,
    price: Number(row.price),
    currency: row.currency,
    location: row.location,
    condition: row.condition,
    description: row.description,
    sellerType: row.seller_type,
    ownerId: row.user_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    featured: Boolean(row.featured),
    image: row.image_url,
    postedAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

export async function initializeListings() {
  const pool = await getPool();
  const countResult = await pool.query('SELECT COUNT(1) AS total FROM listings');
  const total = Number(countResult.rows[0]?.total || 0);

  if (total > 0) {
    return;
  }

  for (const item of seedListings) {
    await pool.query(
      `
        INSERT INTO listings (
          user_id,
          owner_name,
          owner_email,
          title,
          description,
          price,
          currency,
          category,
          location,
          condition,
          seller_type,
          featured,
          image_url,
          created_at
        )
        VALUES (
          NULL,
          NULL,
          NULL,
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11
        )
      `,
      [
        item.title,
        item.description,
        Number(item.price),
        item.currency || 'EUR',
        item.category,
        item.location,
        item.condition,
        item.sellerType,
        item.featured,
        item.image,
        new Date(item.postedAt)
      ]
    );
  }
}

export async function getListings() {
  const pool = await getPool();
  const result = await pool.query('SELECT * FROM listings');
  return result.rows.map(mapListing);
}

export async function addListing(listing) {
  const pool = await getPool();
  const result = await pool.query(
    `
      INSERT INTO listings (
        user_id,
        owner_name,
        owner_email,
        title,
        description,
        price,
        currency,
        category,
        location,
        condition,
        seller_type,
        featured,
        image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
    [
      listing.ownerId ? Number(listing.ownerId) : null,
      listing.ownerName,
      listing.ownerEmail,
      listing.title,
      listing.description,
      Number(listing.price),
      listing.currency,
      listing.category,
      listing.location,
      listing.condition,
      listing.sellerType,
      Boolean(listing.featured),
      listing.image
    ]
  );

  return mapListing(result.rows[0]);
}
