const { PrismaClient: SQLiteClient } = require("../node_modules/@prisma/client-sqlite");
const { PrismaClient: PostgresClient } = require("../node_modules/@prisma/client");

const sqlite = new SQLiteClient({
  datasources: {
    db: {
      url: "file:C:/Users/shash/Downloads/SPORTSURF/SPORTSURF/prisma/dev.db",
    },
  },
});

const neon = new PostgresClient();

async function migrate() {
  console.log("Starting SQLite → Neon migration...\n");

  try {
    // 1. Users
    const users = await sqlite.user.findMany();
    console.log(`Users: ${users.length}`);

    for (const row of users) {
      await neon.user.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 2. Categories
    const categories = await sqlite.category.findMany();
    console.log(`Categories: ${categories.length}`);

    for (const row of categories) {
      await neon.category.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 3. SubCategories
    const subCategories = await sqlite.subCategory.findMany();
    console.log(`SubCategories: ${subCategories.length}`);

    for (const row of subCategories) {
      await neon.subCategory.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 4. Products
    const products = await sqlite.product.findMany();
    console.log(`Products: ${products.length}`);

    for (const row of products) {
      await neon.product.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 5. Accounts
    const accounts = await sqlite.account.findMany();
    console.log(`Accounts: ${accounts.length}`);

    for (const row of accounts) {
      await neon.account.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 6. Sessions
    const sessions = await sqlite.session.findMany();
    console.log(`Sessions: ${sessions.length}`);

    for (const row of sessions) {
      await neon.session.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 7. Verification Tokens
    const verificationTokens = await sqlite.verificationToken.findMany();
    console.log(`VerificationTokens: ${verificationTokens.length}`);

    for (const row of verificationTokens) {
      await neon.verificationToken.upsert({
        where: { token: row.token },
        update: row,
        create: row,
      });
    }

    // 8. Site Settings
    const settings = await sqlite.siteSettings.findMany();
    console.log(`SiteSettings: ${settings.length}`);

    for (const row of settings) {
      await neon.siteSettings.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 9. Ticker Updates
    const tickers = await sqlite.tickerUpdate.findMany();
    console.log(`TickerUpdates: ${tickers.length}`);

    for (const row of tickers) {
      await neon.tickerUpdate.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 10. Collaborations
    const collaborations = await sqlite.collaboration.findMany();
    console.log(`Collaborations: ${collaborations.length}`);

    for (const row of collaborations) {
      await neon.collaboration.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 11. Homepage Grid
    const gridItems = await sqlite.homepageGridItem.findMany();
    console.log(`HomepageGridItems: ${gridItems.length}`);

    for (const row of gridItems) {
      await neon.homepageGridItem.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 12. Navigation
    const navigationItems = await sqlite.navigationItem.findMany();
    console.log(`NavigationItems: ${navigationItems.length}`);

    for (const row of navigationItems) {
      await neon.navigationItem.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 13. Hero Sections
    const heroes = await sqlite.heroSection.findMany();
    console.log(`HeroSections: ${heroes.length}`);

    for (const row of heroes) {
      await neon.heroSection.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 14. Projects
    const projects = await sqlite.project.findMany();
    console.log(`Projects: ${projects.length}`);

    for (const row of projects) {
      await neon.project.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 15. Testimonials
    const testimonials = await sqlite.testimonial.findMany();
    console.log(`Testimonials: ${testimonials.length}`);

    for (const row of testimonials) {
      await neon.testimonial.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 16. Contact Requests
    const contactRequests = await sqlite.contactRequest.findMany();
    console.log(`ContactRequests: ${contactRequests.length}`);

    for (const row of contactRequests) {
      await neon.contactRequest.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    // 17. OTP
    const otps = await sqlite.otp.findMany();
    console.log(`OTPs: ${otps.length}`);

    for (const row of otps) {
      await neon.otp.upsert({
        where: { id: row.id },
        update: row,
        create: row,
      });
    }

    console.log("\nMigration completed successfully.");
  } catch (error) {
    console.error("\nMigration failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await sqlite.$disconnect();
    await neon.$disconnect();
  }
}

migrate();