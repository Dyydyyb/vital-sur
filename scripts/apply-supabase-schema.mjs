import fs from "fs";
import path from "path";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:1569957772Db!@db.kkpbhzcilnmbyrplssbz.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Conectando a Supabase PostgreSQL con cliente pg...");
  await client.connect();
  console.log("¡Conexión establecida!");

  const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
  const sqlContent = fs.readFileSync(schemaPath, "utf-8");

  console.log("Ejecutando supabase/schema.sql completo...");
  await client.query(sqlContent);
  console.log("Esquema SQL aplicado exitosamente.");

  // Otorgar permisos a anon y authenticated para que el cliente de Supabase (REST API) pueda acceder
  console.log("Configurando permisos y recargando cache de PostgREST...");
  await client.query(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
    NOTIFY pgrst, 'reload schema';
  `);

  // Verificar tablas creadas
  const resTables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log("Tablas creadas en public schema:", resTables.rows.map((r) => r.table_name));

  // Verificar categories y store_settings
  const resCat = await client.query("SELECT COUNT(*) as count FROM public.categories;");
  const resSet = await client.query("SELECT * FROM public.store_settings LIMIT 1;");
  console.log("Categorías base creadas:", resCat.rows[0].count);
  console.log("Configuración inicial:", resSet.rows[0].store_name, "-", resSet.rows[0].address);
  console.log("¡Supabase configurado y listo al 100%!");
}

main()
  .catch((e) => {
    console.error("Error aplicando esquema en Supabase:", e);
    process.exit(1);
  })
  .finally(() => client.end());
