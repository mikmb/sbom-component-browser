-- CreateEnum
CREATE TYPE "SbomFormat" AS ENUM ('CYCLONEDX', 'SPDX', 'OTHER');

-- CreateEnum
CREATE TYPE "SbomStatus" AS ENUM ('UPLOADED', 'PARSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sbom" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "format" "SbomFormat" NOT NULL DEFAULT 'OTHER',
    "specVersion" TEXT,
    "status" "SbomStatus" NOT NULL DEFAULT 'UPLOADED',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parsedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "rawJson" JSONB,

    CONSTRAINT "Sbom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Component" (
    "id" TEXT NOT NULL,
    "sbomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "purl" TEXT,
    "group" TEXT,
    "type" TEXT,
    "supplier" TEXT,
    "license" TEXT,
    "scope" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_ownerId_name_key" ON "Project"("ownerId", "name");

-- CreateIndex
CREATE INDEX "Sbom_projectId_idx" ON "Sbom"("projectId");

-- CreateIndex
CREATE INDEX "Sbom_status_idx" ON "Sbom"("status");

-- CreateIndex
CREATE INDEX "Component_sbomId_idx" ON "Component"("sbomId");

-- CreateIndex
CREATE INDEX "Component_name_idx" ON "Component"("name");

-- CreateIndex
CREATE INDEX "Component_name_version_idx" ON "Component"("name", "version");

-- CreateIndex
CREATE INDEX "Component_purl_idx" ON "Component"("purl");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sbom" ADD CONSTRAINT "Sbom_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Component" ADD CONSTRAINT "Component_sbomId_fkey" FOREIGN KEY ("sbomId") REFERENCES "Sbom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
