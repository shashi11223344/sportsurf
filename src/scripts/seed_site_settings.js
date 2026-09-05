const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Site Settings...");
  await prisma.siteSettings.deleteMany();
  await prisma.siteSettings.create({
    data: {
      siteName: "SPORTSURF",
      primaryColor: "#f59e0b",
      secondaryColor: "#1e293b",
      fontHeading: "Inter",
      fontBody: "Inter",
      contactEmail: "info@sportsurf.in",
      contactPhone: "+91 9966109191",
      facebookLink: "https://www.facebook.com/schoolmart.in/",
      twitterLink: "https://x.com/schoolmartindia",
      instagramLink: "https://www.instagram.com/schoolmart.in/",
      linkedinLink: "https://www.linkedin.com/school/13397648/admin/inbox/thread/2-YTIyNjJhZTMtZDRhOS00OWJmLWE2YTEtMzU2MWQ4OTc0ZTg2XzEwMA==/",
      youtubeLink: "https://www.youtube.com/@schoolinnovationindia",
      pinterestLink: "https://in.pinterest.com/schoolmartindia/",
      showCategoryBar: true,
      showTicker: true,
    }
  });
  console.log("Settings seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
