-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "price" REAL NOT NULL,
    "discountPrice" REAL,
    "costPrice" REAL NOT NULL,
    "imageOriginal" TEXT,
    "imageSmall" TEXT,
    "imageMedium" TEXT,
    "imageLarge" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
