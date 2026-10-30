import { promises as fs } from "node:fs";
import path from "node:path";
import type { Product, ProductPatch, ProductWriteValues } from "@/lib/products";
import { extensionFromMime } from "@/lib/validation";

/**
 * Backend LOCAL (aucune configuration requise) :
 *  - les produits vivent dans `data/products.json` (persistance disque) ;
 *  - les images téléversées dans `public/uploads/` (servies publiquement).
 *
 * Réservé au développement / à un serveur Node avec disque accessible :
 * en production, configurez Supabase (variables d'environnement) —
 * l'application bascule alors automatiquement sur cet adaptateur.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "products.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Les écritures sont enchaînées séquentiellement pour éviter que deux
 * actions concurrentes n'écrasent le fichier l'une de l'autre.
 */
let writeQueue: Promise<unknown> = Promise.resolve();
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn("[AfriDigit] data/products.json illisible : considéré comme vide.");
      return [];
    }
    return parsed as Product[];
  } catch {
    // Fichier absent (premier lancement) : base vide, aucun bruit.
    return [];
  }
}

async function writeAll(products: Product[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = DATA_FILE + ".tmp";
  await fs.writeFile(tmpFile, JSON.stringify(products, null, 2), "utf8");
  await fs.rename(tmpFile, DATA_FILE);
}

function byOrder(a: Product, b: Product): number {
  return a.position - b.position || a.created_at.localeCompare(b.created_at);
}

export async function listLocalProducts(): Promise<Product[]> {
  const products = await readAll();
  return [...products].sort(byOrder);
}

export async function getLocalProduct(id: string): Promise<Product | null> {
  const products = await readAll();
  return products.find((product) => product.id === id) ?? null;
}

export async function createLocalProduct(values: ProductWriteValues): Promise<Product> {
  return serialize(async () => {
    const products = await readAll();
    const now = new Date().toISOString();
    const product: Product = {
      id: crypto.randomUUID(),
      position: products.length,
      created_at: now,
      updated_at: now,
      ...values,
    };
    await writeAll([...products, product]);
    return product;
  });
}

export async function updateLocalProduct(
  id: string,
  patch: ProductPatch
): Promise<Product | null> {
  return serialize(async () => {
    const products = await readAll();
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) {
      return null;
    }
    const updated: Product = {
      ...products[index],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    products[index] = updated;
    await writeAll(products);
    return updated;
  });
}

export async function deleteLocalProduct(id: string): Promise<Product | null> {
  return serialize(async () => {
    const products = await readAll();
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) {
      return null;
    }
    const [removed] = products.splice(index, 1);
    await writeAll(products);
    return removed;
  });
}

export async function reorderLocalProducts(orderedIds: string[]): Promise<void> {
  return serialize(async () => {
    const products = await readAll();
    const rank = new Map(orderedIds.map((id, index) => [id, index]));
    for (const product of products) {
      const next = rank.get(product.id);
      if (next !== undefined) {
        product.position = next;
        product.updated_at = new Date().toISOString();
      }
    }
    await writeAll(products);
  });
}

/** Enregistre l'image dans public/uploads et renvoie son URL publique. */
export async function saveLocalImage(file: File): Promise<string> {
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extensionFromMime(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, name), buffer);
  return `/uploads/${name}`;
}

/** Supprime (au mieux) une image hébergée localement. */
export async function removeLocalImage(imageUrl: string | null): Promise<void> {
  if (!imageUrl) return;
  const clean = imageUrl.split("?")[0];
  if (!clean.startsWith("/uploads/")) return;
  const name = path.basename(clean);
  if (!name || name.includes("/")) return;
  try {
    await fs.rm(path.join(UPLOADS_DIR, name), { force: true });
  } catch (exception) {
    console.error("[AfriDigit] Suppression d'image locale ignorée :", exception);
  }
}
