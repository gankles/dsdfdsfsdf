// Data helper functions for the solar website

import fs from 'fs';
import path from 'path';
import { slugify } from './utils';

// Define data directory path
const DATA_DIR = 'C:/Users/Victoria/Solar_Directory/data';

/**
 * Interface for solar product data
 */
export interface SolarProduct {
  name: string;
  slug: string;
  type: string;
  manufacturer: string;
  efficiency: number;
  power_output: number;
  warranty_years: number;
  price_per_watt: number;
  dimensions: {
    length: number;
    width: number;
    depth: number;
  };
  weight: number;
  country: string;
  region?: string;
  applications: string[];
  features: string[];
  certifications: string[];
  description: string;
  pros: string[];
  cons: string[];
  tags: string[];
}

/**
 * Gets all solar products
 */
export function getAllProducts(): SolarProduct[] {
  const productsDirectory = path.join(DATA_DIR, 'products');
  const filenames = fs.readdirSync(productsDirectory);

  const products = filenames.map(filename => {
    const filePath = path.join(productsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents) as SolarProduct;
  });

  return products;
}

/**
 * Gets a solar product by slug
 */
export function getProductBySlug(slug: string): SolarProduct | null {
  try {
    const filePath = path.join(DATA_DIR, `products/${slug}.json`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents) as SolarProduct;
  } catch (error) {
    return null;
  }
}

/**
 * Gets all product types
 */
export function getAllTypes(): string[] {
  const products = getAllProducts();
  const types = new Set(products.map(product => product.type));
  return Array.from(types);
}

/**
 * Gets products by type
 */
export function getProductsByType(type: string): SolarProduct[] {
  const products = getAllProducts();
  return products.filter(product => slugify(product.type) === type);
}

/**
 * Gets all manufacturers
 */
export function getAllManufacturers(): string[] {
  const products = getAllProducts();
  const manufacturers = new Set(products.map(product => product.manufacturer));
  return Array.from(manufacturers);
}

/**
 * Gets products by manufacturer
 */
export function getProductsByManufacturer(manufacturer: string): SolarProduct[] {
  const products = getAllProducts();
  return products.filter(product => slugify(product.manufacturer) === manufacturer);
}

/**
 * Gets all efficiency ranges
 */
export function getAllEfficiencyRanges(): string[] {
  const ranges = [
    'low-efficiency',
    'standard-efficiency',
    'high-efficiency',
    'premium-efficiency'
  ];
  return ranges;
}

/**
 * Gets products by efficiency range
 */
export function getProductsByEfficiencyRange(range: string): SolarProduct[] {
  const products = getAllProducts();

  switch (range) {
    case 'low-efficiency':
      return products.filter(product => product.efficiency < 0.15);
    case 'standard-efficiency':
      return products.filter(product => product.efficiency >= 0.15 && product.efficiency < 0.18);
    case 'high-efficiency':
      return products.filter(product => product.efficiency >= 0.18 && product.efficiency < 0.21);
    case 'premium-efficiency':
      return products.filter(product => product.efficiency >= 0.21);
    default:
      return [];
  }
}

/**
 * Gets all countries
 */
export function getAllCountries(): string[] {
  const products = getAllProducts();
  const countries = new Set(products.map(product => product.country));
  return Array.from(countries);
}

/**
 * Gets products by country
 */
export function getProductsByCountry(country: string): SolarProduct[] {
  const products = getAllProducts();
  return products.filter(product => slugify(product.country) === country);
}

/**
 * Gets all regions for a country
 */
export function getAllRegionsForCountry(country: string): string[] {
  const products = getProductsByCountry(country);
  const regions = new Set(
    products
      .filter(product => product.region)
      .map(product => product.region as string)
  );
  return Array.from(regions);
}

/**
 * Gets products by country and region
 */
export function getProductsByCountryAndRegion(country: string, region: string): SolarProduct[] {
  const products = getProductsByCountry(country);
  return products.filter(product => product.region && slugify(product.region) === region);
}

/**
 * Gets all applications
 */
export function getAllApplications(): string[] {
  const products = getAllProducts();
  const applications = new Set<string>();

  products.forEach(product => {
    product.applications.forEach(application => {
      applications.add(application);
    });
  });

  return Array.from(applications);
}

/**
 * Gets products by application
 */
export function getProductsByApplication(application: string): SolarProduct[] {
  const products = getAllProducts();
  return products.filter(product =>
    product.applications.some(app => slugify(app) === application)
  );
}

/**
 * Gets all tags
 */
export function getAllTags(): string[] {
  const products = getAllProducts();
  const tags = new Set<string>();

  products.forEach(product => {
    product.tags.forEach(tag => {
      tags.add(tag);
    });
  });

  return Array.from(tags);
}

/**
 * Gets products by tag
 */
export function getProductsByTag(tag: string): SolarProduct[] {
  const products = getAllProducts();
  return products.filter(product =>
    product.tags.some(t => slugify(t) === tag)
  );
}
