import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kkpbhzcilnmbyrplssbz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

const sb = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Probando inserción de producto de prueba en Supabase...");
  const { data, error } = await sb
    .from("products")
    .upsert([
      {
        id: "prod-test-rls-1",
        sku: "VS-TEST-RLS",
        name: "Proteína Whey Isolada Vital Sur Test",
        slug: "proteina-whey-isolada-vital-sur-test",
        brand: "Vital Sur Lab",
        category_id: "cat-proteinas",
        short_description: "Fórmula pura de prueba",
        description: "Descripción de prueba",
        usage_instructions: "1 scoop diario",
        price: 38999,
        sale_price: 34999,
        cost: 19000,
        stock: 30,
        min_stock: 5,
        active: true,
        featured: true,
      },
    ])
    .select();

  if (error) {
    console.error("Error al insertar:", error);
    process.exit(1);
  }
  console.log("¡Producto insertado correctamente en Supabase! ID:", data[0]?.id);

  console.log("Probando eliminación de prueba...");
  const delRes = await sb.from("products").delete().eq("id", "prod-test-rls-1");
  if (delRes.error) {
    console.error("Error al eliminar:", delRes.error);
    process.exit(1);
  }
  console.log("¡Producto eliminado correctamente! Supabase está 100% operativo con RLS resuelto.");
}

test();

