DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentProvider" AS ENUM ('PAYMOB');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "course_payments" (
    "id" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'PAYMOB',
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "phone" TEXT NOT NULL,
    "billing_name" TEXT NOT NULL,
    "billing_email" TEXT NOT NULL,
    "provider_order_id" TEXT,
    "provider_transaction_id" TEXT,
    "checkout_url" TEXT,
    "client_secret" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_payments_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    IF to_regclass('course_enrollments') IS NOT NULL THEN
        ALTER TABLE "course_enrollments"
        ADD COLUMN IF NOT EXISTS "payment_id" TEXT;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "course_payments_provider_transaction_id_key" ON "course_payments"("provider_transaction_id");
CREATE INDEX IF NOT EXISTS "course_payments_user_id_course_id_idx" ON "course_payments"("user_id", "course_id");
CREATE INDEX IF NOT EXISTS "course_payments_course_id_idx" ON "course_payments"("course_id");
CREATE INDEX IF NOT EXISTS "course_payments_status_idx" ON "course_payments"("status");
CREATE INDEX IF NOT EXISTS "course_payments_provider_order_id_idx" ON "course_payments"("provider_order_id");
DO $$ BEGIN
    IF to_regclass('course_enrollments') IS NOT NULL THEN
        CREATE UNIQUE INDEX IF NOT EXISTS "course_enrollments_payment_id_key" ON "course_enrollments"("payment_id");
    END IF;
END $$;

DO $$ BEGIN
    ALTER TABLE "course_payments"
    ADD CONSTRAINT "course_payments_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "course_payments"
    ADD CONSTRAINT "course_payments_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
    IF to_regclass('course_enrollments') IS NOT NULL THEN
        ALTER TABLE "course_enrollments"
        ADD CONSTRAINT "course_enrollments_payment_id_fkey"
        FOREIGN KEY ("payment_id") REFERENCES "course_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_table THEN NULL;
END $$;
