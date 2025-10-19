-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RECOVERY');

-- CreateTable
CREATE TABLE "states" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" INTEGER NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "zip" INTEGER NOT NULL,
    "cityId" INTEGER NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_plants" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "addressId" INTEGER NOT NULL,

    CONSTRAINT "work_plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "route_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" SERIAL NOT NULL,
    "miles" TEXT NOT NULL,
    "routeTypeId" INTEGER NOT NULL,
    "pickWorkPlantId" INTEGER NOT NULL,
    "dropWorkPlantId" INTEGER NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "password" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_divisions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "transport_divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "truckNumber" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "transportDivisionId" INTEGER NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "bolNumber" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "instructions" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "assignmentDate" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "material" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "driverId" INTEGER,
    "routeId" INTEGER,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_has_routes" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "routeId" INTEGER NOT NULL,

    CONSTRAINT "order_has_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_confirmations" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "delivery_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_codes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "states_name_key" ON "states"("name");

-- CreateIndex
CREATE UNIQUE INDEX "route_types_name_key" ON "route_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_truckNumber_key" ON "drivers"("truckNumber");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "order_has_routes_orderId_routeId_key" ON "order_has_routes"("orderId", "routeId");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_plants" ADD CONSTRAINT "work_plants_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_routeTypeId_fkey" FOREIGN KEY ("routeTypeId") REFERENCES "route_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_pickWorkPlantId_fkey" FOREIGN KEY ("pickWorkPlantId") REFERENCES "work_plants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_dropWorkPlantId_fkey" FOREIGN KEY ("dropWorkPlantId") REFERENCES "work_plants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_transportDivisionId_fkey" FOREIGN KEY ("transportDivisionId") REFERENCES "transport_divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_has_routes" ADD CONSTRAINT "order_has_routes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_has_routes" ADD CONSTRAINT "order_has_routes_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_confirmations" ADD CONSTRAINT "delivery_confirmations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_codes" ADD CONSTRAINT "password_reset_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
