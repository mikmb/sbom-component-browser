import { SbomFormat } from "@prisma/client";
import type { ParseResult, NormalizedComponent } from "./types";

type JsonRecord = Record<string, unknown>;

function isRecord(v: unknown): v is JsonRecord {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export function parseSbomJson(input: unknown): ParseResult {
  if (!isRecord(input)) {
    return { format: SbomFormat.OTHER, specVersion: null, components: [] };
  }

  // CycloneDX
  if (input["bomFormat"] === "CycloneDX") {
    const specVersion = asString(input["specVersion"]);
    const rawComponents = Array.isArray(input["components"])
      ? input["components"]
      : [];

    const components: NormalizedComponent[] = rawComponents
      .map(parseCycloneDxComponent)
      .filter((c): c is NormalizedComponent => c !== null);

    return { format: SbomFormat.CYCLONEDX, specVersion, components };
  }

  // SPDX
  if (
    typeof input["spdxVersion"] === "string" ||
    typeof input["SPDXID"] === "string"
  ) {
    const specVersion = asString(input["spdxVersion"]);
    const rawPackages = Array.isArray(input["packages"])
      ? input["packages"]
      : [];

    const components: NormalizedComponent[] = rawPackages
      .map(parseSpdxPackage)
      .filter((c): c is NormalizedComponent => c !== null);

    return { format: SbomFormat.SPDX, specVersion, components };
  }

  return { format: SbomFormat.OTHER, specVersion: null, components: [] };
}

function parseCycloneDxComponent(v: unknown): NormalizedComponent | null {
  if (!isRecord(v)) return null;

  const name = asString(v["name"]) ?? "unknown";

  const supplierObj = v["supplier"];
  const supplier = isRecord(supplierObj) ? asString(supplierObj["name"]) : null;

  // licenses[0].license.(id|name)
  let license: string | null = null;
  const licenses = v["licenses"];
  if (Array.isArray(licenses) && licenses.length > 0 && isRecord(licenses[0])) {
    const licContainer = licenses[0] as JsonRecord;
    const lic = licContainer["license"];
    if (isRecord(lic)) {
      license = asString(lic["id"]) ?? asString(lic["name"]);
    }
  }

  return {
    name,
    version: asString(v["version"]),
    purl: asString(v["purl"]),
    group: asString(v["group"]),
    type: asString(v["type"]),
    supplier,
    license,
    scope: null,
    metadata: v,
  };
}

function parseSpdxPackage(v: unknown): NormalizedComponent | null {
  if (!isRecord(v)) return null;

  const name = asString(v["name"]) ?? "unknown";
  const version = asString(v["versionInfo"]);
  const supplier = asString(v["supplier"]);

  const license =
    asString(v["licenseConcluded"]) ?? asString(v["licenseDeclared"]);

  // externalRefs -> find purl
  let purl: string | null = null;
  const externalRefs = v["externalRefs"];
  if (Array.isArray(externalRefs)) {
    for (const ref of externalRefs) {
      if (!isRecord(ref)) continue;
      const referenceType = asString(ref["referenceType"]);
      const referenceLocator = asString(ref["referenceLocator"]);
      if (referenceType?.toLowerCase().includes("purl") && referenceLocator) {
        purl = referenceLocator;
        break;
      }
    }
  }

  return {
    name,
    version,
    purl,
    group: null,
    type: null,
    supplier,
    license,
    scope: null,
    metadata: v,
  };
}
