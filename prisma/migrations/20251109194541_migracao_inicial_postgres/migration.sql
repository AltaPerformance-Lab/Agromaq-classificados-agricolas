-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AnuncioStatus" AS ENUM ('ATIVO', 'PAUSADO', 'VENDIDO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATE_AD', 'EDIT_AD', 'PAUSE_AD', 'REACTIVATE_AD_USER', 'DELETE_AD_LOGICAL', 'SUSPEND_AD', 'REACTIVATE_AD_ADMIN', 'DELETE_AD_PERMANENT', 'ADMIN_EDIT_AD', 'DELETE_AD_IMAGE', 'PROMOTE_AD', 'VERIFY_AD', 'EDIT_USER', 'DELETE_USER', 'ADD_CREDITS', 'CREATE_BLOG_POST', 'EDIT_BLOG_POST', 'DELETE_BLOG_POST');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnuncioMaquina" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" BIGINT NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "horas" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "descricao" TEXT,
    "informacoes_adicionais" TEXT,
    "condicao" TEXT,
    "potencia_motor" TEXT,
    "transmissao" TEXT,
    "tracao" TEXT,
    "cabine" TEXT,
    "operacao_previa" TEXT,
    "condicao_pneus" TEXT,
    "pneus_dianteiros" TEXT,
    "pneus_traseiros" TEXT,
    "ar_condicionado" BOOLEAN NOT NULL DEFAULT false,
    "lamina_frontal" BOOLEAN NOT NULL DEFAULT false,
    "carregador_frontal" BOOLEAN NOT NULL DEFAULT false,
    "gps" BOOLEAN NOT NULL DEFAULT false,
    "piloto_automatico" BOOLEAN NOT NULL DEFAULT false,
    "unico_dono" BOOLEAN NOT NULL DEFAULT false,
    "status" "AnuncioStatus" NOT NULL DEFAULT 'ATIVO',
    "suspensionReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioMaquina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnuncioImagem" (
    "id" SERIAL NOT NULL,
    "anuncioId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "isPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnuncioImagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnuncioFazenda" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "preco" BIGINT NOT NULL,
    "estado" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "area_total_hectares" DECIMAL(10,2) NOT NULL,
    "area_pastagem_hectares" DECIMAL(10,2),
    "area_lavoura_hectares" DECIMAL(10,2),
    "area_reserva_hectares" DECIMAL(10,2),
    "tipo_solo" TEXT,
    "topografia" TEXT,
    "possui_casa_sede" BOOLEAN NOT NULL DEFAULT false,
    "possui_curral" BOOLEAN NOT NULL DEFAULT false,
    "possui_recursos_hidricos" BOOLEAN NOT NULL DEFAULT false,
    "descricao" TEXT,
    "benfeitorias" TEXT,
    "status" "AnuncioStatus" NOT NULL DEFAULT 'ATIVO',
    "suspensionReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioFazenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnuncioImagemFazenda" (
    "id" SERIAL NOT NULL,
    "anuncioId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "isPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnuncioImagemFazenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertaBusca" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "filtros" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertaBusca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPostInteraction" (
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isReadLater" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPostInteraction_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "CommodityPrice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "variation" DECIMAL(10,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommodityPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdPlacement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "AdPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "status" "AdStatus" NOT NULL DEFAULT 'INACTIVE',
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "targetUrl" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "advertiserId" INTEGER NOT NULL,
    "placementId" TEXT NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" INTEGER NOT NULL,
    "actorName" TEXT NOT NULL,
    "action" "ActivityType" NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "reason" TEXT,
    "details" JSONB,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "AnuncioMaquina_slug_key" ON "AnuncioMaquina"("slug");

-- CreateIndex
CREATE INDEX "AnuncioMaquina_userId_idx" ON "AnuncioMaquina"("userId");

-- CreateIndex
CREATE INDEX "AnuncioMaquina_status_deletedAt_tipo_marca_estado_idx" ON "AnuncioMaquina"("status", "deletedAt", "tipo", "marca", "estado");

-- CreateIndex
CREATE INDEX "AnuncioMaquina_preco_idx" ON "AnuncioMaquina"("preco");

-- CreateIndex
CREATE INDEX "AnuncioMaquina_ano_idx" ON "AnuncioMaquina"("ano");

-- CreateIndex
CREATE INDEX "AnuncioMaquina_horas_idx" ON "AnuncioMaquina"("horas");

-- CreateIndex
CREATE INDEX "AnuncioImagem_anuncioId_idx" ON "AnuncioImagem"("anuncioId");

-- CreateIndex
CREATE UNIQUE INDEX "AnuncioFazenda_slug_key" ON "AnuncioFazenda"("slug");

-- CreateIndex
CREATE INDEX "AnuncioFazenda_userId_idx" ON "AnuncioFazenda"("userId");

-- CreateIndex
CREATE INDEX "AnuncioFazenda_status_deletedAt_estado_cidade_idx" ON "AnuncioFazenda"("status", "deletedAt", "estado", "cidade");

-- CreateIndex
CREATE INDEX "AnuncioFazenda_preco_idx" ON "AnuncioFazenda"("preco");

-- CreateIndex
CREATE INDEX "AnuncioFazenda_area_total_hectares_idx" ON "AnuncioFazenda"("area_total_hectares");

-- CreateIndex
CREATE INDEX "AnuncioImagemFazenda_anuncioId_idx" ON "AnuncioImagemFazenda"("anuncioId");

-- CreateIndex
CREATE INDEX "AlertaBusca_userId_idx" ON "AlertaBusca"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "UserPostInteraction_userId_idx" ON "UserPostInteraction"("userId");

-- CreateIndex
CREATE INDEX "UserPostInteraction_postId_idx" ON "UserPostInteraction"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "AdPlacement_id_key" ON "AdPlacement"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Advertiser_contactEmail_key" ON "Advertiser"("contactEmail");

-- CreateIndex
CREATE INDEX "Ad_advertiserId_idx" ON "Ad"("advertiserId");

-- CreateIndex
CREATE INDEX "Ad_placementId_idx" ON "Ad"("placementId");

-- CreateIndex
CREATE INDEX "Ad_status_startDate_endDate_idx" ON "Ad"("status", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_idx" ON "ActivityLog"("actorId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_targetType_targetId_idx" ON "ActivityLog"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "AnuncioMaquina" ADD CONSTRAINT "AnuncioMaquina_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioImagem" ADD CONSTRAINT "AnuncioImagem_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "AnuncioMaquina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioFazenda" ADD CONSTRAINT "AnuncioFazenda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioImagemFazenda" ADD CONSTRAINT "AnuncioImagemFazenda_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "AnuncioFazenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaBusca" ADD CONSTRAINT "AlertaBusca_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPostInteraction" ADD CONSTRAINT "UserPostInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPostInteraction" ADD CONSTRAINT "UserPostInteraction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "AdPlacement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
