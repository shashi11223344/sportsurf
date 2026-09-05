import { PrismaClient } from "@prisma/client";
import * as productsModule from "../src/data/products";
import * as projectsModule from "../src/data/projects";
import * as testimonialsModule from "../src/data/testimonials";

const prisma = new PrismaClient();

function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

async function main() {
  const products = Array.isArray((productsModule as any).products) ? (productsModule as any).products : [];
  const projects = Array.isArray((projectsModule as any).projects) ? (projectsModule as any).projects : [];
  const testimonials = Array.isArray((testimonialsModule as any).testimonials) ? (testimonialsModule as any).testimonials : [];

  const [dbProducts, dbProjects, dbTestimonials, dbCategories, dbNav, dbTicker, dbHeroes, settings] = await Promise.all([
    prisma.product.findMany({ select: { slug: true, name: true } }),
    prisma.project.findMany({ select: { name: true, city: true } }),
    prisma.testimonial.findMany({ select: { name: true, institution: true } }),
    prisma.category.findMany({ select: { label: true } }),
    prisma.navigationItem.findMany({ select: { label: true, href: true } }),
    prisma.tickerUpdate.findMany({ select: { text: true } }),
    prisma.heroSection.findMany({ select: { page: true, title: true } }),
    prisma.siteSettings.findFirst(),
  ]);

  const sourceProducts = products.map((p: any) => ({ slug: p.slug, name: p.name }));
  const sourceProjects = projects.map((p: any) => ({ name: p.name, city: p.city }));
  const sourceTestimonials = testimonials.map((t: any) => ({ name: t.name, institution: t.institution }));

  const missingProducts = sourceProducts.filter((p: { slug: string; name: string }) => !dbProducts.some((d) => d.slug === p.slug));
  const missingProjects = sourceProjects.filter((p: { name: string; city: string }) => !dbProjects.some((d) => d.name === p.name && d.city === p.city));
  const missingTestimonials = sourceTestimonials.filter((t: { name: string; institution: string }) => !dbTestimonials.some((d) => d.name === t.name && d.institution === t.institution));

  const siteCategoryLabels = ["Surface sports", "Water sports", "Small sports", "Budget sports", "Sports academies", "Play zones", "Adventure sports games", "Challenge courses", "Talent scout clubs"];
  const missingCategories = siteCategoryLabels.filter((label) => !dbCategories.some((c) => c.label === label));

  const navText = ["Home", "Products", "Projects", "About Us", "Contact"];
  const missingNav = navText.filter((label) => !dbNav.some((n) => n.label === label));

  const tickerText = [
    "Free site visit & consultation across India",
    "ISO 9001:2015 Certified",
    "FLAT 10% OFF on first project",
    "Premium Sports Surfaces & Equipment"
  ];
  const missingTicker = tickerText.filter((text) => !dbTicker.some((t) => t.text === text));

  const heroPages = ["home"];
  const missingHeroes = heroPages.filter((page) => !dbHeroes.some((h) => h.page === page));

  const result = {
    dbCounts: {
      products: dbProducts.length,
      projects: dbProjects.length,
      testimonials: dbTestimonials.length,
      categories: dbCategories.length,
      nav: dbNav.length,
      ticker: dbTicker.length,
      heroes: dbHeroes.length,
      settings: settings?.siteName ?? "missing",
    },
    sourceCounts: {
      products: sourceProducts.length,
      projects: sourceProjects.length,
      testimonials: sourceTestimonials.length,
    },
    missingProducts: missingProducts.slice(0, 10),
    missingProjects: missingProjects.slice(0, 10),
    missingTestimonials: missingTestimonials.slice(0, 10),
    missingCategories,
    missingNav,
    missingTicker,
    missingHeroes,
  };

  console.log(JSON.stringify(result, null, 2));

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
