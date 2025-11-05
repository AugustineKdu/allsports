-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "auto_verify" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'DAILY',
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "participant_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "verification_rules" JSONB;

-- CreateTable
CREATE TABLE "shortcuts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "media_url" TEXT,
    "media_type" TEXT,
    "sport" TEXT,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shortcuts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortcut_likes" (
    "id" TEXT NOT NULL,
    "shortcut_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shortcut_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortcut_comments" (
    "id" TEXT NOT NULL,
    "shortcut_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shortcut_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT,
    "contact" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_missions" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "conditions" JSONB,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_missions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shortcut_likes_shortcut_id_user_id_key" ON "shortcut_likes"("shortcut_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_missions_mission_id_key" ON "partner_missions"("mission_id");

-- AddForeignKey
ALTER TABLE "shortcuts" ADD CONSTRAINT "shortcuts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortcut_likes" ADD CONSTRAINT "shortcut_likes_shortcut_id_fkey" FOREIGN KEY ("shortcut_id") REFERENCES "shortcuts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortcut_likes" ADD CONSTRAINT "shortcut_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortcut_comments" ADD CONSTRAINT "shortcut_comments_shortcut_id_fkey" FOREIGN KEY ("shortcut_id") REFERENCES "shortcuts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortcut_comments" ADD CONSTRAINT "shortcut_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_missions" ADD CONSTRAINT "partner_missions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_missions" ADD CONSTRAINT "partner_missions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
