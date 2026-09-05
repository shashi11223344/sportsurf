import { PrismaClient } from "@prisma/client";
import { products } from "../data/products";
import { projects } from "../data/projects";
import { testimonials } from "../data/testimonials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 STARTING FINAL DEPLOYMENT SEED (Railway/Vercel)...");

  // 1. Navigation Menu
  console.log(" - Seeding Navigation Menu...");
  await prisma.navigationItem.deleteMany();
  await prisma.navigationItem.createMany({
    data: [
      { label: "Home", href: "/", order: 10 },
      { label: "Products", href: "/products", order: 20 },
      { label: "Projects", href: "/projects", order: 30 },
      { label: "About Us", href: "/about", order: 40 },
      { label: "Contact", href: "/contact", order: 50 },
    ]
  });

  // 2. Ticker Items
  console.log(" - Seeding Ticker Items...");
  await prisma.tickerUpdate.deleteMany();
  await prisma.tickerUpdate.createMany({
    data: [
      { text: "Free site visit & consultation across India", order: 10 },
      { text: "ISO 9001:2015 Certified", order: 20 },
      { text: "FLAT 10% OFF on first project", order: 30 },
      { text: "Premium Sports Surfaces & Equipment", order: 40 }
    ]
  });

  // 3. Categories & Grid Items
  console.log(" - Seeding Categories...");
  const categoriesList = [
    { label: "Surface sports", order: 10, image: "/images/sports/surface_sports.png" },
    { label: "Water sports", order: 20, image: "/images/sports/water_sports.png" },
    { label: "Small sports", order: 30, image: "/images/sports/small_sports.png" },
    { label: "Budget sports", order: 40, image: "/images/budget_sports.png" },
    { label: "Sports academies", order: 50, image: "/images/sports/academic_campus.png" },
    { label: "Play zones", order: 60, image: "/images/sports/play_zones.png" },
    { label: "Adventure sports games", order: 70, image: "/images/sports/adventure_sports.png" },
    { label: "Challenge courses", order: 80, image: "/images/hero_sports_bg.png" },
    { label: "Talent scout clubs", order: 90, image: "/images/hero_indian_arena.png" },
  ];

  await prisma.category.deleteMany();
  await prisma.category.createMany({
    data: categoriesList.map(c => ({ label: c.label, order: c.order, imageUrl: c.image }))
  });

  await prisma.homepageGridItem.deleteMany();
  await prisma.homepageGridItem.createMany({
    data: categoriesList.map(c => ({ 
      label: c.label, 
      order: c.order, 
      imageUrl: c.image,
      href: `/products?category=${c.label.toLowerCase().replace(/\s+/g, "-")}`,
      description: `Premium ${c.label} solutions customized for performance.`
    }))
  });

  // 4. Products (All 90+)
  console.log(` - Seeding ${products.length} Products...`);
  await prisma.product.deleteMany();
  const productsToCreate = products.map((p: any) => ({
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    shortSpec: p.shortSpec,
    imageUrl: p.images?.[0] || "/images/sports/surface_sports.png",
    imagesJson: JSON.stringify(p.images || [p.imageUrl || "/images/sports/surface_sports.png"]),
    isNew: !!p.isNew,
    isFeatured: !!p.isFeatured,
    heightClass: p.heightClass || "h-[400px]",
    specs: JSON.stringify(p.specs || [])
  }));
  
  const chunkSize = 25;
  for (let i = 0; i < productsToCreate.length; i += chunkSize) {
    await prisma.product.createMany({
      data: productsToCreate.slice(i, i + chunkSize)
    });
  }

  // 5. Projects
  console.log(" - Seeding Projects...");
  await prisma.project.deleteMany();
  await prisma.project.createMany({
    data: projects.map((pj: any) => ({
      name: pj.name,
      city: pj.city,
      state: pj.state,
      surface: pj.surface,
      area: pj.area,
      year: pj.year,
      imageUrl: pj.image || pj.imageUrl,
      isFeatured: true
    }))
  });

  // 6. Testimonials
  console.log(" - Seeding Testimonials...");
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: testimonials.map((t: any, i: number) => ({
      name: t.name,
      institution: t.institution,
      quote: t.quote,
      order: i * 10
    }))
  });

  // 7. Hero Section
  console.log(" - Seeding Hero Section...");
  await prisma.heroSection.deleteMany();
  await prisma.heroSection.create({
    data: {
      page: "home",
      title: "India's Premiere Sports Infrastructure Powerhouse",
      subtitle: "ENGINEERING EXCELLENCE FOR THE NEXT GENERATION OF ATHLETES.",
      imageUrl: "/images/hero_indian_arena.png",
      ctaText: "Explore Solutions",
      ctaLink: "/products",
    }
  });

  // 8. Site Settings
  console.log(" - Seeding Global Settings...");
  await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: {
      siteName: "SPORTSURF",
      contactEmail: "info@sportsurf.in",
      contactPhone: "+91 9966109191",
      facebookLink: "https://www.facebook.com/schoolmart.in/",
      twitterLink: "https://x.com/schoolmartindia",
      instagramLink: "https://www.instagram.com/schoolmart.in/",
      linkedinLink: "https://www.linkedin.com/school/13397648/admin/inbox/thread/2-YTIyNjJhZTMtZDRhOS00OWJmLWE2YTEtMzU2MWQ4OTc0ZTg2XzEwMA==/",
      youtubeLink: "https://www.youtube.com/@schoolinnovationindia",
      pinterestLink: "https://in.pinterest.com/schoolmartindia/",
      aboutText: "Founded in 2013, SportSurf was born from a singular vision: to bring world-class athletic infrastructure to India.",
      aboutOriginTitle: "THE ORIGIN",
      aboutOriginText: "Today, \"Antigravity\" represents our next evolution — a commitment to physics-driven design that minimizes injury risk and maximizes performance potential.",
      statsJson: JSON.stringify([
        { value: 500, suffix: "+", label: "Projects Completed" },
        { value: 18, suffix: "+", label: "States Served" },
        { value: 200, suffix: "+", label: "Institutional Clients" },
        { value: 10, suffix: "+", label: "Years of Trust" }
      ]),
      certsJson: JSON.stringify([
        { title: "ISO 9001:2015" }, { title: "FIFA Quality" }, { title: "IAAF Certified" }, { title: "BIS Approved" }, { title: "NSIC" }
      ])
    },
    create: {
      id: "global",
      siteName: "SPORTSURF",
      contactEmail: "info@sportsurf.in",
      contactPhone: "+91 9966109191",
      facebookLink: "https://www.facebook.com/schoolmart.in/",
      twitterLink: "https://x.com/schoolmartindia",
      instagramLink: "https://www.instagram.com/schoolmart.in/",
      linkedinLink: "https://www.linkedin.com/school/13397648/admin/inbox/thread/2-YTIyNjJhZTMtZDRhOS00OWJmLWE2YTEtMzU2MWQ4OTc0ZTg2XzEwMA==/",
      youtubeLink: "https://www.youtube.com/@schoolinnovationindia",
      pinterestLink: "https://in.pinterest.com/schoolmartindia/",
    }
  });

  // 9. Admin User
  console.log(" - Ensuring Admin Access...");
  const adminEmail = "admin@sportsurf.in";
  const hashedPassword = await bcrypt.hash("Admin@123", 12);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN"
    }
  });

  // Also promote the existing user to ADMIN if requested
  await prisma.user.updateMany({
    where: { email: "b21in011@kitsw.ac.in" },
    data: { role: "ADMIN" }
  });

  console.log("✅ CLOUD SEEDING COMPLETE!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
