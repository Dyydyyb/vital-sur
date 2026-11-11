import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:1569957772Db!@db.kkpbhzcilnmbyrplssbz.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Conectado a PostgreSQL para actualizar políticas RLS...");

  const tables = [
    "products",
    "categories",
    "orders",
    "order_items",
    "customers",
    "stock_movements",
    "coupons",
    "store_settings",
    "staff_users",
  ];

  for (const table of tables) {
    await client.query(`
      DROP POLICY IF EXISTS "Public Read Active ${table}" ON public.${table};
      DROP POLICY IF EXISTS "Public Insert ${table}" ON public.${table};
      DROP POLICY IF EXISTS "Public Read ${table}" ON public.${table};
      DROP POLICY IF EXISTS "Service Role Full Access ${table}" ON public.${table};
      DROP POLICY IF EXISTS "Allow All ${table}" ON public.${table};
      CREATE POLICY "Allow All ${table}" ON public.${table} FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
    `);
    console.log(`Políticas actualizadas para tabla: ${table}`);
  }

  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log("¡Permisos y políticas RLS actualizados exitosamente en Supabase!");
}

main()
  .catch((e) => {
    console.error("Error actualizando RLS:", e);
    process.exit(1);
  })
  .finally(() => client.end());
