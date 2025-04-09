// SEO helper functions for the solar website

import { getRandomInt } from './utils';

/**
 * Interface for meta tags
 */
export interface MetaTags {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: Array<{ url: string; width: number; height: number; alt: string }>;
    locale: string;
    type: string;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
    creator: string;
  };
}

/**
 * Generates meta tags for a product page
 */
export function generateProductMetaTags(product: any, baseUrl: string): MetaTags {
  const titleTemplates = [
    `${product.name} Solar Panel: Efficiency, Cost & Reviews (${new Date().getFullYear()})`,
    `${product.name} - High-Performance Solar Panel Specifications & Reviews`,
    `${product.name} Solar Panel Review: Is It Worth the Investment?`,
    `${product.name}: Complete Solar Panel Specifications and Expert Analysis`,
    `${product.name} Solar Panel: The Ultimate Guide for Homeowners`
  ];

  const descriptionTemplates = [
    `Discover everything about the ${product.name} solar panel including efficiency ratings, cost analysis, warranty information, and real customer reviews. Find out if it's the right choice for your home.`,
    `Comprehensive review of the ${product.name} solar panel. Learn about its efficiency, performance in different conditions, warranty coverage, and how it compares to competitors.`,
    `Looking for detailed information about ${product.name} solar panels? Our expert guide covers specifications, pricing, installation requirements, and long-term performance expectations.`,
    `${product.name} solar panel analysis: Get the facts on efficiency ratings, power output, warranty terms, and real-world performance to make an informed decision for your solar investment.`,
    `Complete breakdown of ${product.name} solar panels including technical specifications, cost-benefit analysis, installation considerations, and customer satisfaction ratings.`
  ];

  const titleIndex = getRandomInt(0, titleTemplates.length - 1);
  const descriptionIndex = getRandomInt(0, descriptionTemplates.length - 1);

  return {
    title: titleTemplates[titleIndex],
    description: descriptionTemplates[descriptionIndex],
    canonical: `${baseUrl}/product/${product.slug}`,
    openGraph: {
      title: titleTemplates[titleIndex],
      description: descriptionTemplates[descriptionIndex],
      url: `${baseUrl}/product/${product.slug}`,
      siteName: 'Solar Energy Guide',
      images: [
        {
          url: `${baseUrl}/images/products/${product.slug}.jpg`,
          width: 1200,
          height: 630,
          alt: product.name
        }
      ],
      locale: 'en_US',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: titleTemplates[titleIndex],
      description: descriptionTemplates[descriptionIndex],
      creator: '@solarenergyguide'
    }
  };
}

/**
 * Generates meta tags for a type index page
 */
export function generateTypeMetaTags(type: string, count: number, baseUrl: string): MetaTags {
  const formattedType = type.replace(/-/g, ' ');
  
  const titleTemplates = [
    `Top ${count} ${formattedType} Solar Panels: Complete Guide (${new Date().getFullYear()})`,
    `Best ${formattedType} Solar Panels: Efficiency, Cost & Reviews`,
    `${formattedType} Solar Panels: Comprehensive Comparison & Buying Guide`,
    `${formattedType} Solar Panel Guide: Features, Benefits & Top Models`,
    `${count} Best ${formattedType} Solar Panels for Your Home or Business`
  ];

  const descriptionTemplates = [
    `Compare the top ${count} ${formattedType} solar panels available today. Our comprehensive guide covers efficiency ratings, costs, warranties, and customer reviews to help you make the best choice.`,
    `Looking for the best ${formattedType} solar panels? Our expert guide compares leading models, highlighting key specifications, performance metrics, and value for money.`,
    `Discover everything you need to know about ${formattedType} solar panels. Our detailed comparison covers efficiency, durability, warranty terms, and real-world performance of top models.`,
    `Complete guide to ${formattedType} solar panels including how they work, advantages over other types, installation considerations, and reviews of the most popular models on the market.`,
    `Research the best ${formattedType} solar panels with our in-depth analysis. Learn about technology differences, performance expectations, cost considerations, and recommended models for different needs.`
  ];

  const titleIndex = getRandomInt(0, titleTemplates.length - 1);
  const descriptionIndex = getRandomInt(0, descriptionTemplates.length - 1);

  return {
    title: titleTemplates[titleIndex],
    description: descriptionTemplates[descriptionIndex],
    canonical: `${baseUrl}/type/${type}`,
    openGraph: {
      title: titleTemplates[titleIndex],
      description: descriptionTemplates[descriptionIndex],
      url: `${baseUrl}/type/${type}`,
      siteName: 'Solar Energy Guide',
      images: [
        {
          url: `${baseUrl}/images/types/${type}.jpg`,
          width: 1200,
          height: 630,
          alt: `${formattedType} solar panels`
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: titleTemplates[titleIndex],
      description: descriptionTemplates[descriptionIndex],
      creator: '@solarenergyguide'
    }
  };
}

/**
 * Generates meta tags for a manufacturer index page
 */
export function generateManufacturerMetaTags(manufacturer: string, count: number, baseUrl: string): MetaTags {
  const formattedManufacturer = manufacturer.replace(/-/g, ' ');
  
  const titleTemplates = [
    `${formattedManufacturer} Solar Panels: Complete Product Line Review (${new Date().getFullYear()})`,
    `${formattedManufacturer} Solar Panel Guide: Models, Specifications & Performance`,
    `${formattedManufacturer}: Solar Panel Technology, Efficiency & Customer Reviews`,
    `${count} Best Solar Panels from ${formattedManufacturer} - Comprehensive Analysis`,
    `${formattedManufacturer} Solar Panels: Are They Worth the Investment?`
  ];

  const descriptionTemplates = [
    `Comprehensive review of ${formattedManufacturer}'s solar panel lineup. Compare efficiency ratings, warranty terms, and price points across their ${count} models to find the best fit for your needs.`,
    `Everything you need to know about ${formattedManufacturer} solar panels. Our detailed guide covers technology innovations, performance metrics, warranty information, and customer satisfaction.`,
    `Discover the complete range of solar panels from ${formattedManufacturer}. Our expert analysis covers technical specifications, real-world performance, and how they compare to competing brands.`,
    `In-depth look at ${formattedManufacturer}'s solar panel technology. Learn about their manufacturing process, quality control, efficiency ratings, and long-term reliability across their product line.`,
    `Should you choose ${formattedManufacturer} for your solar installation? Our comprehensive guide examines their product range, technology advantages, warranty coverage, and customer service reputation.`
  ];

  const titleIndex = getRandomInt(0, titleTemplates.length - 1);
  const descriptionIndex = getRandomInt(0, descriptionTemplates.length - 1);

  return {
    title: titleTemplates[titleIndex],
    description: descriptionTemplates[descriptionIndex],
    canonical: `${baseUrl}/manufacturer/${manufacturer}`,
    openGraph: {
      title: titleTemplates[titleIndex],
      description: descriptionTemplates[descriptionIndex],
      url: `${baseUrl}/manufacturer/${manufacturer}`,
      siteName: 'Solar Energy Guide',
      images: [
        {
          url: `${baseUrl}/images/manufacturers/${manufacturer}.jpg`,
          width: 1200,
          height: 630,
          alt: `${formattedManufacturer} solar panels`
        }
      ],
      locale: 'en_US',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: titleTemplates[titleIndex],
      description: descriptionTemplates[descriptionIndex],
      creator: '@solarenergyguide'
    }
  };
}
