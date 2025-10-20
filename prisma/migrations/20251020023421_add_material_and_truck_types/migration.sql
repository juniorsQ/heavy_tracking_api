-- CreateTable
CREATE TABLE "material_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "material_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truck_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" DOUBLE PRECISION NOT NULL,
    "description" TEXT,

    CONSTRAINT "truck_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "material_types_name_key" ON "material_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "truck_types_name_key" ON "truck_types"("name");
