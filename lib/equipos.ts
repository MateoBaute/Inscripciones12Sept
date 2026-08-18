import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import { db } from "@/lib/db";

type Sport = "voley" | "futbol";

const requiredMembers: Record<Sport, number> = {
  voley: 6,
  futbol: 5,
};

type TeamBody = {
  name?: unknown;
  captainName?: unknown;
  members?: unknown;
};

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function insertTeam(sport: Sport, body: TeamBody) {
  const memberCount = requiredMembers[sport];

  if (!isText(body.name)) {
    return NextResponse.json({ error: "El nombre del equipo es obligatorio." }, { status: 400 });
  }

  if (!isText(body.captainName)) {
    return NextResponse.json({ error: "El nombre del capitan es obligatorio." }, { status: 400 });
  }

  if (!Array.isArray(body.members) || body.members.length !== memberCount || body.members.some((member) => !isText(member))) {
    return NextResponse.json({ error: `Debes registrar exactamente ${memberCount} integrantes con nombre completo.` }, { status: 400 });
  }

  const members = body.members as string[];
  if (members[0].trim() !== body.captainName.trim()) {
    return NextResponse.json({ error: "El primer integrante debe coincidir con el nombre del capitan." }, { status: 400 });
  }

  const columns = ["nombre", "capitan", ...Array.from({ length: memberCount - 1 }, (_, index) => `integrante${index + 2}`)];
  const placeholders = columns.map(() => "?").join(", ");
  const values = [body.name.trim(), body.captainName.trim(), ...members.slice(1).map((member) => member.trim())];

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO ${sport} (${columns.join(", ")}) VALUES (${placeholders})`,
      values,
    );

    return NextResponse.json({ message: "Equipo registrado exitosamente.", id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error(`Error al insertar equipo de ${sport}:`, error);
    return NextResponse.json({ error: "No se pudo guardar el equipo. Verifica la conexion con la base de datos e intenta nuevamente." }, { status: 500 });
  }
}