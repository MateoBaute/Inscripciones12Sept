import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

type Sport = "futbol" | "voley";

type TeamRow = RowDataPacket & {
  id: number;
  nombre: string;
  capitan: string;
  integrante2: string;
  integrante3: string;
  integrante4: string;
  integrante5: string;
  integrante6?: string;
};

function toTeam(row: TeamRow, sport: Sport) {
  const members = [row.capitan, row.integrante2, row.integrante3, row.integrante4, row.integrante5];
  if (sport === "voley" && row.integrante6) members.push(row.integrante6);

  return { id: row.id, name: row.nombre, captain: row.capitan, members, sport };
}

export async function GET(request: Request) {
  const sport = new URL(request.url).searchParams.get("deporte");

  if (sport && sport !== "futbol" && sport !== "voley") {
    return NextResponse.json({ error: "El filtro debe ser futbol o voley." }, { status: 400 });
  }

  try {
    const teams = [];

    if (!sport || sport === "futbol") {
      const [rows] = await db.query<TeamRow[]>("SELECT id, nombre, capitan, integrante2, integrante3, integrante4, integrante5 FROM futbol ORDER BY id DESC");
      teams.push(...rows.map((row) => toTeam(row, "futbol")));
    }

    if (!sport || sport === "voley") {
      const [rows] = await db.query<TeamRow[]>("SELECT id, nombre, capitan, integrante2, integrante3, integrante4, integrante5, integrante6 FROM voley ORDER BY id DESC");
      teams.push(...rows.map((row) => toTeam(row, "voley")));
    }

    return NextResponse.json({ teams }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error al consultar equipos inscritos:", error);
    return NextResponse.json({ error: "No se pudieron cargar los equipos. Verifica la conexion con la base de datos." }, { status: 500 });
  }
}