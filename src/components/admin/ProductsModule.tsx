"use client";

import React, { useState, useRef } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Star,
  X,
  Save,
} from "lucide-react";
import { Product, IllustrationType } from "@/lib/types";
import { useVitalSur } from "@/context/VitalSurContext";
import { formatARS, escapeCsvCell } from "@/lib/format";
import { ProductVectorArt } from "@/components/brand/ProductVectorArt";

const ILLUSTRATION_OPTIONS: { value: IllustrationType; label: string }[] = [
  { value: "whey-jar", label: "Pote Grande Proteína (Whey)" },
  { value: "creatine-tub", label: "Pote Mediano Creatina" },
  { value: "preworkout-tub", label: "Envase Pre-Entreno" },
  { value: "bcaa-powder", label: "Envase Aminoácidos BCAA" },
  { value: "magnesium-bottle", label: "Frasco Cápsulas Magnesio" },
  { value: "omega-bottle", label: "Frasco Omega 3" },
  { value: "collagen-jar", label: "Pote Colágeno Hidrolizado" },
  { value: "burner-bottle", label: "Frasco Termogénico" },
  { value: "shaker-cup", label: "Vaso Mezclador Shaker" },
  { value: "straps-gear", label: "Cintas de Agarre Straps" },
  { value: "combo-pack", label: "Combo Múltiple" },
];

export function ProductsModule() {
  const {
    db,
    saveProduct,
    deleteProduct,
    importProductsBatch,
  } = useVitalSur();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [flavorsText, setFlavorsText] = useState("");
  const [sizesText, setSizesText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredProducts = db.products.filter((p) => {
    if (categoryFilter !== "all" && p.categoryId !== categoryFilter)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenNewProduct = () => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: `VS-NEW-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      slug: "",
      brand: "Vital Sur Lab",
      categoryId: db.categories[0]?.id || "cat-proteinas",
      shortDescription: "",
      description: "",
      usageInstructions: "Consumir 1 porción diaria según indicación nutricional.",
      price: 29999,
      salePrice: null,
      cost: 16000,
      stock: 25,
      minStock: 8,
      active: true,
      featured: false,
      flavors: ["Clásico Natural", "Vainilla Austral"],
      sizes: ["500 g"],
      nutritionFacts: {
        servingSize: "30 g (1 medida)",
        servingsPerContainer: 30,
        rows: [
          { nutrient: "Valor Energético", amountPerServing: "115 kcal", dailyValuePct: "6%" },
          { nutrient: "Proteínas", amountPerServing: "24 g", dailyValuePct: "32%" },
        ],
        ingredients: "Materia prima pura seleccionada por Vital Sur Lab.",
        allergens: "Sin TACC.",
      },
      illustrationType: "whey-jar",
      accentColor: "#2E9E6B",
      soldCount: 0,
      createdAt: new Date().toISOString(),
    };
    setFlavorsText(newProd.flavors.join(", "));
    setSizesText(newProd.sizes.join(", "));
    setEditingProduct(newProd);
  };

  const handleOpenEdit = (prod: Product) => {
    setFlavorsText(prod.flavors.join(", "));
    setSizesText(prod.sizes.join(", "));
    setEditingProduct({ ...prod });
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const slug =
      editingProduct.slug.trim() ||
      editingProduct.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const flavors = flavorsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const sizes = sizesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await saveProduct({
      ...editingProduct,
      slug,
      flavors: flavors.length ? flavors : ["Clásico"],
      sizes: sizes.length ? sizes : ["Estándar"],
    });
    setEditingProduct(null);
  };

  // Exportación a CSV
  const handleExportCsv = () => {
    const headers = [
      "SKU",
      "Nombre",
      "Marca",
      "CategoriaId",
      "PrecioListaARS",
      "PrecioOfertaARS",
      "CostoARS",
      "Stock",
      "StockMinimo",
      "Activo",
      "Destacado",
      "Sabores",
      "Tamanos",
    ];
    const rows = db.products.map((p) =>
      [
        p.sku,
        p.name,
        p.brand,
        p.categoryId,
        p.price,
        p.salePrice ?? "",
        p.cost,
        p.stock,
        p.minStock,
        p.active ? "SI" : "NO",
        p.featured ? "SI" : "NO",
        p.flavors.join(" | "),
        p.sizes.join(" | "),
      ].map(escapeCsvCell)
    );

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vital-sur-productos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importación desde CSV
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = String(event.target?.result || "");
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length <= 1) return;

      const parsedProducts: Product[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        if (cols.length < 8) continue;
        const [
          sku,
          name,
          brand,
          categoryId,
          priceStr,
          saleStr,
          costStr,
          stockStr,
          minStockStr,
          activeStr,
          featuredStr,
          flavorsStr,
          sizesStr,
        ] = cols;

        const price = Number(priceStr) || 25000;
        const salePrice = saleStr ? Number(saleStr) : null;
        const cost = Number(costStr) || Math.round(price * 0.55);
        const stock = Number(stockStr) || 10;
        const minStock = Number(minStockStr) || 5;

        parsedProducts.push({
          id: `prod-csv-${Date.now()}-${i}`,
          sku: sku || `VS-CSV-${i}`,
          name: name || `Producto Importado ${i}`,
          slug: (name || `producto-${i}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
          brand: brand || "Vital Sur Lab",
          categoryId: categoryId || "cat-proteinas",
          shortDescription: "Suplemento deportivo importado por lote CSV.",
          description: "Fórmula de alta pureza certificada por Vital Sur.",
          usageInstructions: "Consumir 1 porción diaria.",
          price,
          salePrice,
          cost,
          stock,
          minStock,
          active: activeStr !== "NO",
          featured: featuredStr === "SI",
          flavors: flavorsStr
            ? flavorsStr.split("|").map((s) => s.trim())
            : ["Neutro"],
          sizes: sizesStr
            ? sizesStr.split("|").map((s) => s.trim())
            : ["500 g"],
          nutritionFacts: {
            servingSize: "1 medida",
            servingsPerContainer: 30,
            rows: [
              { nutrient: "Pureza", amountPerServing: "100%", dailyValuePct: "-" },
            ],
            ingredients: "Materia prima pura.",
            allergens: "Sin TACC.",
          },
          illustrationType: "whey-jar",
          accentColor: "#2E9E6B",
          soldCount: 0,
          createdAt: new Date().toISOString(),
        });
      }

      if (parsedProducts.length > 0) {
        await importProductsBatch(parsedProducts);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Barra de Herramientas de Productos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-card-lg bg-white p-5 border border-brand-border shadow-soft">
        <div>
          <h2 className="font-display text-lg font-extrabold text-brand-ink">
            Catálogo de Productos ({db.products.length})
          </h2>
          <p className="text-xs text-brand-ink-muted">
            Administrá precios en ARS, ofertas, costos, variantes, visibilidad e
            importación/exportación por CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-pill border border-brand-border bg-brand-surface px-4 py-2 text-xs font-bold text-brand-ink hover:border-brand-green"
          >
            <Download className="h-4 w-4 text-brand-green" strokeWidth={2} />
            <span>Exportar CSV</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-pill border border-brand-border bg-brand-surface px-4 py-2 text-xs font-bold text-brand-ink hover:border-brand-green"
          >
            <Upload className="h-4 w-4 text-brand-blue-dark" strokeWidth={2} />
            <span>Importar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewProduct}
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green px-4 py-2 text-xs font-bold text-white hover:bg-brand-green-dark shadow-sm"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar producto por nombre, SKU o marca..."
            className="w-full rounded-pill border border-brand-border bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-brand-ink focus:border-brand-green focus:outline-none"
          />
          <Search
            className="absolute left-3.5 top-3 h-4 w-4 text-brand-ink-subtle"
            strokeWidth={2}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-pill border border-brand-border bg-white px-4 py-2.5 text-xs font-bold text-brand-ink focus:border-brand-green focus:outline-none"
        >
          <option value="all">Todas las categorías</option>
          {db.categories
            .filter((c) => c.parentId === null)
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
      </div>

      {/* Tabla de Productos */}
      <div className="rounded-card-lg bg-white border border-brand-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface text-brand-ink-muted">
                <th className="py-3.5 px-4 font-bold">Producto</th>
                <th className="py-3.5 px-4 font-bold">SKU / Marca</th>
                <th className="py-3.5 px-4 font-bold">Precio / Oferta</th>
                <th className="py-3.5 px-4 font-bold">Costo / Margen</th>
                <th className="py-3.5 px-4 font-bold">Stock</th>
                <th className="py-3.5 px-4 font-bold">Estado</th>
                <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-xs text-brand-ink-muted"
                  >
                    No hay productos cargados aún. Hacé clic en &quot;Nuevo Producto&quot; o importá un CSV para comenzar.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                const effectivePrice = product.salePrice ?? product.price;
                const profit = effectivePrice - product.cost;
                const marginPct = Math.round((profit / effectivePrice) * 100);
                const isLowStock = product.stock <= product.minStock;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-brand-surface/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-brand-surface p-1.5 border border-brand-border">
                          <ProductVectorArt
                            type={product.illustrationType}
                            accentColor={product.accentColor}
                            brand={product.brand}
                          />
                        </div>
                        <div>
                          <p className="font-display font-bold text-brand-ink">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-brand-ink-muted">
                            {product.flavors.length} sabores ·{" "}
                            {product.sizes.join(", ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-brand-ink block">
                        {product.sku}
                      </span>
                      <span className="text-[11px] text-brand-ink-muted">
                        {product.brand}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-display font-extrabold text-brand-ink block">
                        {formatARS(effectivePrice)}
                      </span>
                      {product.salePrice && (
                        <span className="text-[11px] text-brand-ink-subtle line-through">
                          Lista: {formatARS(product.price)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-brand-ink-muted block">
                        Costo: {formatARS(product.cost)}
                      </span>
                      <span className="text-[11px] font-bold text-brand-green-dark">
                        +{formatARS(profit)} ({marginPct}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-pill px-2.5 py-0.5 text-[11px] font-extrabold ${
                          isLowStock
                            ? "bg-amber-50 text-amber-800 border border-amber-300"
                            : "bg-brand-green-soft text-brand-green-dark"
                        }`}
                      >
                        {product.stock} u.
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            saveProduct({ ...product, active: !product.active })
                          }
                          title={
                            product.active
                              ? "Visible en tienda"
                              : "Oculto en tienda"
                          }
                          className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                            product.active
                              ? "bg-brand-green-soft text-brand-green-dark"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {product.active ? (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>Oculto</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            saveProduct({
                              ...product,
                              featured: !product.featured,
                            })
                          }
                          title="Destacar en Home"
                          className={`rounded-full p-1.5 border ${
                            product.featured
                              ? "bg-brand-green text-white border-brand-green"
                              : "bg-white text-brand-ink-subtle border-brand-border"
                          }`}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="rounded-full p-2 text-brand-ink hover:bg-brand-surface hover:text-brand-green"
                          title="Editar producto"
                        >
                          <Edit3 className="h-4 w-4" strokeWidth={1.9} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product.id)}
                          className="rounded-full p-2 text-brand-ink-subtle hover:bg-red-50 hover:text-red-600"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Alta / Edición de Producto */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-ink/40 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl rounded-card-lg bg-white border border-brand-border shadow-soft-lg overflow-hidden my-8">
            <div className="flex items-center justify-between bg-brand-surface px-6 py-4 border-b border-brand-border">
              <h3 className="font-display text-base font-extrabold text-brand-ink">
                {db.products.some((p) => p.id === editingProduct.id)
                  ? `Editar Producto: ${editingProduct.name}`
                  : "Alta de Nuevo Producto"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-full p-1.5 text-brand-ink-muted hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveForm}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-brand-ink mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-sm text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Código SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        sku: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-sm font-mono font-bold text-brand-ink focus:border-brand-green focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Marca / Línea
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        brand: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-semibold text-brand-ink"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Categoría Principal
                  </label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-bold text-brand-ink"
                  >
                    {db.categories
                      .filter((c) => c.parentId === null)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Ilustración Vectorial SVG
                  </label>
                  <select
                    value={editingProduct.illustrationType}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        illustrationType: e.target.value as IllustrationType,
                      })
                    }
                    className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-xs font-bold text-brand-ink"
                  >
                    {ILLUSTRATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Precios y Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-card bg-brand-surface p-4 border border-brand-border">
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Precio Lista (ARS)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-1.5 font-bold text-brand-ink"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Precio Oferta (ARS)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.salePrice ?? ""}
                    placeholder="Opcional"
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        salePrice: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-1.5 font-bold text-brand-green-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Costo (ARS)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.cost}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        cost: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-1.5 font-semibold text-brand-ink"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-1.5 font-bold text-brand-ink"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.minStock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        minStock: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-brand-border bg-white px-3 py-1.5 font-semibold text-brand-ink"
                  />
                </div>
              </div>

              {/* Variantes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Sabores (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={flavorsText}
                    onChange={(e) => setFlavorsText(e.target.value)}
                    placeholder="Chocolate Suizo, Vainilla Austral"
                    className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-brand-ink"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-ink mb-1">
                    Tamaños / Presentaciones (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={sizesText}
                    onChange={(e) => setSizesText(e.target.value)}
                    placeholder="500 g, 1 kg"
                    className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-brand-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-ink mb-1">
                  Descripción Corta
                </label>
                <input
                  type="text"
                  value={editingProduct.shortDescription}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-brand-border bg-brand-surface px-3.5 py-2 text-brand-ink"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-ink mb-1">
                  Descripción Completa y Beneficios
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-brand-border bg-brand-surface p-3 text-brand-ink"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-brand-border">
                <div className="flex items-center gap-5">
                  <label className="inline-flex items-center gap-2 font-bold text-brand-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.active}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded text-brand-green"
                    />
                    <span>Producto Activo en Tienda</span>
                  </label>
                  <label className="inline-flex items-center gap-2 font-bold text-brand-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.featured}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          featured: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded text-brand-green"
                    />
                    <span>Destacar en Home</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="rounded-pill border border-brand-border bg-white px-5 py-2.5 font-bold text-brand-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green px-6 py-2.5 font-bold text-white hover:bg-brand-green-dark"
                  >
                    <Save className="h-4 w-4" />
                    <span>Guardar Producto</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

