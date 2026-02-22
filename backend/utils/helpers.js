export function generateSku({ name, category, existingCount }) {
  const namePart = (name || "PRD").replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "PRD";
  const catPart = (category || "GEN").replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "GEN";
  const serial = String((existingCount || 0) + 1).padStart(4, "0");
  return `${catPart}-${namePart}-${serial}`;
}

export function parsePagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function parseSort(sortBy, defaultField = "createdAt") {
  if (!sortBy) {
    return { [defaultField]: -1 };
  }

  const [field, direction] = sortBy.split(":");
  return { [field]: direction === "asc" ? 1 : -1 };
}
