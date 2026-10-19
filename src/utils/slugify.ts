// src/utils/slugify.ts
// Genera un slug amigable para URLs a partir de un título
// Ej: "¡El Lago de los Cisnes!" -> "el-lago-de-los-cisnes"
export function generarSlug(texto: string): string {
  return String(texto)
    .normalize('NFD') // descompone los acentos en letras + diacríticos
    .replace(/[\u0300-\u036f]/g, '') // elimina los diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // todo lo no alfanumérico se vuelve guion
    .replace(/^-+|-+$/g, '') // recorta guiones inicial y final
    .slice(0, 220); // respeta el límite de la columna slug VARCHAR(220)
}
