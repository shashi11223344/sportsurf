const { PrismaClient } = require("../node_modules/@prisma/client-sqlite");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:C:/Users/shash/Downloads/SPORTSURF/SPORTSURF/prisma/dev.db"
    }
  }
});

async function main() {
  console.log("Users:", await prisma.user.count());
  console.log("Products:", await prisma.product.count());
  console.log("Categories:", await prisma.category.count());
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


