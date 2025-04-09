import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { slugify } from '../lib/utils';
import OpenAI from 'openai';
import pLimit from 'p-limit';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
});

// Rate limiting configuration
const ITEMS_PER_MINUTE = 500; // Maximum API calls per minute
const BATCH_SIZE = 50; // Process in batches of 50
const DELAY_BETWEEN_BATCHES = Math.floor(60000 / (ITEMS_PER_MINUTE / BATCH_SIZE));
const limit = pLimit(BATCH_SIZE);

// Interface for solar product data
interface SolarProduct {
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
  aiContent?: {
    detailed_description: string;
    installation_tips: string[];
    maintenance_guide: string;
    performance_factors: string[];
    roi_analysis: string;
    environmental_impact: string;
    comparison_notes: string;
    ideal_use_cases: string[];
    additional_tags: string[];
  };
}

// Interface for category data
interface CategoryData {
  title: string;
  slug: string;
  description: string;
  products: string[]; // Array of product slugs
  count: number;
  aiContent?: {
    overview: string;
    benefits: string[];
    considerations: string[];
    trends: string;
    faqs: Array<{ question: string; answer: string }>;
  };
}

// Helper function to sleep
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to generate AI content for a product
async function generateProductAIContent(product: SolarProduct): Promise<SolarProduct['aiContent']> {
  try {
    const prompt = `Generate detailed information about the "${product.name}" solar panel in JSON format.

Example output format:
{
  "detailed_description": "A comprehensive description of the panel's technology and features.",
  "installation_tips": [
    "Tip 1 for optimal installation",
    "Tip 2 for optimal installation",
    "Tip 3 for optimal installation"
  ],
  "maintenance_guide": "Information about maintaining the panel for optimal performance.",
  "performance_factors": [
    "Factor 1 affecting performance",
    "Factor 2 affecting performance",
    "Factor 3 affecting performance"
  ],
  "roi_analysis": "Analysis of return on investment for this panel.",
  "environmental_impact": "Information about the environmental benefits of this panel.",
  "comparison_notes": "How this panel compares to similar products.",
  "ideal_use_cases": [
    "Ideal use case 1",
    "Ideal use case 2",
    "Ideal use case 3"
  ],
  "additional_tags": [
    "tag1",
    "tag2",
    "tag3",
    "tag4",
    "tag5"
  ]
}

Consider these data points in your response:
- Panel type: ${product.type}
- Manufacturer: ${product.manufacturer}
- Efficiency: ${product.efficiency * 100}%
- Power output: ${product.power_output} watts
- Warranty: ${product.warranty_years} years
- Price per watt: $${product.price_per_watt}
- Dimensions: ${product.dimensions.length}mm x ${product.dimensions.width}mm x ${product.dimensions.depth}mm
- Weight: ${product.weight}kg
- Country of origin: ${product.country}
- Applications: ${product.applications.join(', ')}
- Features: ${product.features.join(', ')}
- Certifications: ${product.certifications.join(', ')}
- Description: ${product.description}
- Pros: ${product.pros.join(', ')}
- Cons: ${product.cons.join(', ')}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are an expert in solar energy technology, providing detailed, accurate information about solar panels in JSON format."
      }, {
        role: "user",
        content: prompt
      }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error(`Error generating AI content for ${product.name}:`, error);
    return {
      detailed_description: `The ${product.name} is a ${product.type} solar panel manufactured by ${product.manufacturer} with an efficiency rating of ${product.efficiency * 100}% and power output of ${product.power_output} watts.`,
      installation_tips: ["Ensure proper orientation for maximum sunlight exposure", "Follow manufacturer guidelines for mounting", "Hire a certified installer for best results"],
      maintenance_guide: "Regularly clean the panels and inspect for damage or debris. Check connections annually.",
      performance_factors: ["Sunlight exposure", "Panel orientation", "Temperature", "Shading"],
      roi_analysis: `With a price per watt of $${product.price_per_watt} and warranty of ${product.warranty_years} years, this panel offers a competitive return on investment.`,
      environmental_impact: "Solar panels significantly reduce carbon emissions compared to fossil fuel energy sources.",
      comparison_notes: `Compared to other ${product.type} panels, this model offers ${product.efficiency * 100}% efficiency which is ${product.efficiency > 0.2 ? 'above' : 'around'} industry average.`,
      ideal_use_cases: product.applications,
      additional_tags: ["solar", "renewable energy", "green technology", "sustainable", "clean energy"]
    };
  }
}

// Function to generate AI content for a category
async function generateCategoryAIContent(category: CategoryData, products: SolarProduct[]): Promise<CategoryData['aiContent']> {
  try {
    const productSummaries = products.slice(0, 5).map(p =>
      `${p.name}: ${p.type} panel with ${p.efficiency * 100}% efficiency and ${p.power_output} watts output`
    ).join(', ');

    const prompt = `Generate detailed information about ${category.title} solar panels in JSON format.

Example output format:
{
  "overview": "A comprehensive overview of this category of solar panels.",
  "benefits": [
    "Benefit 1 of this category",
    "Benefit 2 of this category",
    "Benefit 3 of this category"
  ],
  "considerations": [
    "Consideration 1 when choosing this category",
    "Consideration 2 when choosing this category",
    "Consideration 3 when choosing this category"
  ],
  "trends": "Current trends and future outlook for this category of solar panels.",
  "faqs": [
    {
      "question": "Frequently asked question 1?",
      "answer": "Answer to question 1."
    },
    {
      "question": "Frequently asked question 2?",
      "answer": "Answer to question 2."
    },
    {
      "question": "Frequently asked question 3?",
      "answer": "Answer to question 3."
    },
    {
      "question": "Frequently asked question 4?",
      "answer": "Answer to question 4."
    },
    {
      "question": "Frequently asked question 5?",
      "answer": "Answer to question 5."
    }
  ]
}

Category: ${category.title}
Description: ${category.description}
Number of products: ${category.count}
Example products: ${productSummaries}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are an expert in solar energy technology, providing detailed, accurate information about categories of solar panels in JSON format."
      }, {
        role: "user",
        content: prompt
      }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error(`Error generating AI content for category ${category.title}:`, error);
    return {
      overview: `${category.title} solar panels are a popular choice for solar installations.`,
      benefits: ["Renewable energy source", "Reduces electricity bills", "Environmentally friendly"],
      considerations: ["Initial investment cost", "Installation requirements", "Maintenance needs"],
      trends: "The solar industry continues to grow with improving technology and decreasing costs.",
      faqs: [
        {
          question: `What are ${category.title} solar panels?`,
          answer: `${category.title} solar panels are ${category.description}`
        },
        {
          question: "How long do solar panels last?",
          answer: "Most solar panels come with a 25-year warranty and can last 30+ years."
        },
        {
          question: "Are solar panels worth the investment?",
          answer: "Solar panels typically pay for themselves within 5-10 years and provide free electricity after that."
        },
        {
          question: "Do solar panels work in cloudy weather?",
          answer: "Yes, solar panels still generate electricity in cloudy weather, though at reduced efficiency."
        },
        {
          question: "How much maintenance do solar panels require?",
          answer: "Solar panels require minimal maintenance, mainly occasional cleaning and inspection."
        }
      ]
    };
  }
}

// Main function to process data
async function processData() {
  try {
    console.log('Starting data processing...');

    // Define data directories
    const sourceDataDir = path.join('C:/Users/Victoria/Solar_Directory/data');
    const generatedDataDir = path.join('C:/Users/Victoria/Solar_Directory/my-next-app/data/generated');
    const productsDir = path.join(generatedDataDir, 'cheeses');
    const categoriesDir = path.join(generatedDataDir, 'indexes');

    if (!fs.existsSync(productsDir)) {
      fs.mkdirSync(productsDir, { recursive: true });
    }

    if (!fs.existsSync(categoriesDir)) {
      fs.mkdirSync(categoriesDir, { recursive: true });
    }

    // Read and parse CSV file
    const csvFilePath = path.join(sourceDataDir, 'data.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Processing ${records.length} solar panels...`);

    // Process each record
    const products: SolarProduct[] = records.map((record: any) => ({
      name: record.name,
      slug: record.slug,
      type: record.type,
      manufacturer: record.manufacturer,
      efficiency: parseFloat(record.efficiency),
      power_output: parseInt(record.power_output),
      warranty_years: parseInt(record.warranty_years),
      price_per_watt: parseFloat(record.price_per_watt),
      dimensions: {
        length: parseInt(record.length),
        width: parseInt(record.width),
        depth: parseInt(record.depth)
      },
      weight: parseFloat(record.weight),
      country: record.country,
      region: record.region !== 'NA' ? record.region : undefined,
      applications: record.applications.split(',').map((s: string) => s.trim()),
      features: record.features.split(',').map((s: string) => s.trim()),
      certifications: record.certifications.split(',').map((s: string) => s.trim()),
      description: record.description,
      pros: record.pros.split(',').map((s: string) => s.trim()),
      cons: record.cons.split(',').map((s: string) => s.trim()),
      tags: record.tags.split(',').map((s: string) => s.trim())
    }));

    // Process products with AI content
    let processedCount = 0;
    const startTime = Date.now();
    let lastLogTime = startTime;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      try {
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(products.length / BATCH_SIZE)}...`);

        const batchResults = await Promise.all(
          batch.map(product => limit(async () => {
            // Check if product JSON already exists
            const productFilePath = path.join(productsDir, `${product.slug}.json`);
            if (fs.existsSync(productFilePath)) {
              console.log(`Product ${product.name} already exists, skipping...`);
              return JSON.parse(fs.readFileSync(productFilePath, 'utf8'));
            }

            // Generate AI content
            console.log(`Generating AI content for ${product.name}...`);
            const aiContent = await generateProductAIContent(product);
            const enrichedProduct = { ...product, aiContent };

            // Save product JSON
            fs.writeFileSync(
              productFilePath,
              JSON.stringify(enrichedProduct, null, 2)
            );

            return enrichedProduct;
          }))
        );

        processedCount += batch.length;

        // Log progress
        const currentTime = Date.now();
        if (currentTime - lastLogTime >= 10000 || processedCount === products.length) {
          const elapsedMinutes = (currentTime - startTime) / 60000;
          const itemsPerMinute = Math.round(processedCount / elapsedMinutes) || 0;
          const progress = Math.floor((processedCount / products.length) * 100);
          const estimatedTotalMinutes = products.length / (itemsPerMinute || 1);
          const remainingMinutes = Math.max(0, estimatedTotalMinutes - elapsedMinutes);

          console.log(
            `Progress: ${progress}% | ` +
            `${processedCount}/${products.length} products | ` +
            `${itemsPerMinute}/minute | ` +
            `~${Math.round(remainingMinutes)}m remaining`
          );
          lastLogTime = currentTime;
        }

        if (i + BATCH_SIZE < products.length) {
          console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
          await sleep(DELAY_BETWEEN_BATCHES);
        }
      } catch (error) {
        console.error('Error processing batch:', error);
      }
    }

    console.log('All products processed. Generating category data...');

    // Generate category data

    // 1. Type categories
    const types = [...new Set(products.map(p => p.type))];
    for (const type of types) {
      const typeSlug = slugify(type);
      const typeProducts = products.filter(p => p.type === type);
      const typeData: CategoryData = {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Solar Panels`,
        slug: typeSlug,
        description: `Solar panels using ${type} technology.`,
        products: typeProducts.map(p => p.slug),
        count: typeProducts.length
      };

      // Check if category JSON already exists
      const categoryFilePath = path.join(categoriesDir, `type-${typeSlug}.json`);
      if (!fs.existsSync(categoryFilePath)) {
        console.log(`Generating AI content for ${type} panels...`);
        typeData.aiContent = await generateCategoryAIContent(typeData, typeProducts);
        fs.writeFileSync(
          categoryFilePath,
          JSON.stringify(typeData, null, 2)
        );
      } else {
        console.log(`Category ${type} already exists, skipping...`);
      }
    }

    // 2. Manufacturer categories
    const manufacturers = [...new Set(products.map(p => p.manufacturer))];
    for (const manufacturer of manufacturers) {
      const manufacturerSlug = slugify(manufacturer);
      const manufacturerProducts = products.filter(p => p.manufacturer === manufacturer);
      const manufacturerData: CategoryData = {
        title: `${manufacturer} Solar Panels`,
        slug: manufacturerSlug,
        description: `Solar panels manufactured by ${manufacturer}.`,
        products: manufacturerProducts.map(p => p.slug),
        count: manufacturerProducts.length
      };

      // Check if category JSON already exists
      const categoryFilePath = path.join(categoriesDir, `manufacturer-${manufacturerSlug}.json`);
      if (!fs.existsSync(categoryFilePath)) {
        console.log(`Generating AI content for ${manufacturer} panels...`);
        manufacturerData.aiContent = await generateCategoryAIContent(manufacturerData, manufacturerProducts);
        fs.writeFileSync(
          categoryFilePath,
          JSON.stringify(manufacturerData, null, 2)
        );
      } else {
        console.log(`Category ${manufacturer} already exists, skipping...`);
      }
    }

    // 3. Efficiency categories
    const efficiencyRanges = [
      { name: 'Low Efficiency', slug: 'low-efficiency', min: 0, max: 0.15 },
      { name: 'Standard Efficiency', slug: 'standard-efficiency', min: 0.15, max: 0.18 },
      { name: 'High Efficiency', slug: 'high-efficiency', min: 0.18, max: 0.21 },
      { name: 'Premium Efficiency', slug: 'premium-efficiency', min: 0.21, max: 1 }
    ];

    for (const range of efficiencyRanges) {
      const rangeProducts = products.filter(p => p.efficiency >= range.min && p.efficiency < range.max);
      if (rangeProducts.length === 0) continue;

      const rangeData: CategoryData = {
        title: `${range.name} Solar Panels`,
        slug: range.slug,
        description: `Solar panels with efficiency ratings ${(range.min * 100).toFixed(1)}% to ${(range.max * 100).toFixed(1)}%.`,
        products: rangeProducts.map(p => p.slug),
        count: rangeProducts.length
      };

      // Check if category JSON already exists
      const categoryFilePath = path.join(categoriesDir, `efficiency-${range.slug}.json`);
      if (!fs.existsSync(categoryFilePath)) {
        console.log(`Generating AI content for ${range.name} panels...`);
        rangeData.aiContent = await generateCategoryAIContent(rangeData, rangeProducts);
        fs.writeFileSync(
          categoryFilePath,
          JSON.stringify(rangeData, null, 2)
        );
      } else {
        console.log(`Category ${range.name} already exists, skipping...`);
      }
    }

    // 4. Country categories
    const countries = [...new Set(products.map(p => p.country))];
    for (const country of countries) {
      const countrySlug = slugify(country);
      const countryProducts = products.filter(p => p.country === country);
      const countryData: CategoryData = {
        title: `Solar Panels from ${country}`,
        slug: countrySlug,
        description: `Solar panels manufactured in ${country}.`,
        products: countryProducts.map(p => p.slug),
        count: countryProducts.length
      };

      // Check if category JSON already exists
      const categoryFilePath = path.join(categoriesDir, `country-${countrySlug}.json`);
      if (!fs.existsSync(categoryFilePath)) {
        console.log(`Generating AI content for ${country} panels...`);
        countryData.aiContent = await generateCategoryAIContent(countryData, countryProducts);
        fs.writeFileSync(
          categoryFilePath,
          JSON.stringify(countryData, null, 2)
        );
      } else {
        console.log(`Category ${country} already exists, skipping...`);
      }

      // 5. Region categories (for each country)
      const regions = [...new Set(countryProducts.filter(p => p.region).map(p => p.region))];
      for (const region of regions) {
        if (!region) continue;

        const regionSlug = slugify(region);
        const regionProducts = countryProducts.filter(p => p.region === region);
        const regionData: CategoryData = {
          title: `Solar Panels from ${region}, ${country}`,
          slug: regionSlug,
          description: `Solar panels manufactured in ${region}, ${country}.`,
          products: regionProducts.map(p => p.slug),
          count: regionProducts.length
        };

        // Check if category JSON already exists
        const categoryFilePath = path.join(categoriesDir, `region-${countrySlug}-${regionSlug}.json`);
        if (!fs.existsSync(categoryFilePath)) {
          console.log(`Generating AI content for ${region}, ${country} panels...`);
          regionData.aiContent = await generateCategoryAIContent(regionData, regionProducts);
          fs.writeFileSync(
            categoryFilePath,
            JSON.stringify(regionData, null, 2)
          );
        } else {
          console.log(`Category ${region}, ${country} already exists, skipping...`);
        }
      }
    }

    // 6. Application categories
    const allApplications = new Set<string>();
    products.forEach(p => p.applications.forEach(a => allApplications.add(a)));
    const applications = Array.from(allApplications);

    for (const application of applications) {
      const applicationSlug = slugify(application);
      const applicationProducts = products.filter(p => p.applications.includes(application));
      const applicationData: CategoryData = {
        title: `Solar Panels for ${application.charAt(0).toUpperCase() + application.slice(1)} Use`,
        slug: applicationSlug,
        description: `Solar panels suitable for ${application} applications.`,
        products: applicationProducts.map(p => p.slug),
        count: applicationProducts.length
      };

      // Check if category JSON already exists
      const categoryFilePath = path.join(categoriesDir, `application-${applicationSlug}.json`);
      if (!fs.existsSync(categoryFilePath)) {
        console.log(`Generating AI content for ${application} panels...`);
        applicationData.aiContent = await generateCategoryAIContent(applicationData, applicationProducts);
        fs.writeFileSync(
          categoryFilePath,
          JSON.stringify(applicationData, null, 2)
        );
      } else {
        console.log(`Category ${application} already exists, skipping...`);
      }
    }

    // 7. Tag categories
    const allTags = new Set<string>();
    products.forEach(p => p.tags.forEach(t => allTags.add(t)));
    products.forEach(p => p.aiContent?.additional_tags?.forEach(t => allTags.add(t)));
    const tags = Array.from(allTags);

    for (const tag of tags) {
      const tagSlug = slugify(tag);
      const tagProducts = products.filter(p =>
        p.tags.includes(tag) ||
        p.aiContent?.additional_tags?.includes(tag)
      );

      if (tagProducts.length === 0) continue;

      const tagData: CategoryData = {
        title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Solar Panels`,
        slug: tagSlug,
        description: `Solar panels tagged as ${tag}.`,
        products: tagProducts.map(p => p.slug),
        count: tagProducts.length
      };

      // Check if category JSON already exists
      const categoryFilePath = path.join(categoriesDir, `tag-${tagSlug}.json`);
      if (!fs.existsSync(categoryFilePath)) {
        console.log(`Generating AI content for ${tag} panels...`);
        tagData.aiContent = await generateCategoryAIContent(tagData, tagProducts);
        fs.writeFileSync(
          categoryFilePath,
          JSON.stringify(tagData, null, 2)
        );
      } else {
        console.log(`Category ${tag} already exists, skipping...`);
      }
    }

    console.log('Data processing completed successfully!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Run the main function
processData();
