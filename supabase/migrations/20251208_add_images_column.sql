/*
  # Add images column to products table

  Add a JSONB column to store multiple image URLs for products
*/

ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing products to have their current image_url in the images array
UPDATE products SET images = ARRAY[image_url] WHERE image_url IS NOT NULL;
