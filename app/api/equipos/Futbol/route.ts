import { insertTeam } from "@/lib/equipos";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		return insertTeam("futbol", body);
	} catch (error) {
		console.error("Error al leer la solicitud de futbol:", error);
		return Response.json({ error: "El cuerpo de la solicitud no es un JSON valido." }, { status: 400 });
	}
}
