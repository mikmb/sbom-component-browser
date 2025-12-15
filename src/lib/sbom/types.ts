import { SbomFormat } from "@prisma/client";

export type NormalizedComponent = {
  name: string;
  version?: string | null;
  purl?: string | null;
  group?: string | null;
  type?: string | null;
  supplier?: string | null;
  license?: string | null;
  scope?: string | null;
  metadata?: unknown | null;
};

export type ParseResult = {
  format: SbomFormat;
  specVersion?: string | null;
  components: NormalizedComponent[];
};
