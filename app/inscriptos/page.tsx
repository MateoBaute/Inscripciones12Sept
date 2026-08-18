"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sport = "todos" | "futbol" | "voley";
type Team = { id: number; name: string; captain: string; members: string[]; sport: Exclude<Sport, "todos"> };

const filters: { key: Sport; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "futbol", label: "Futbol" },
  { key: "voley", label: "Voley" },
];

export default function InscriptosPage() {
  const [filter, setFilter] = useState<Sport>("todos");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeams() {
      try {
        const query = filter === "todos" ? "" : `?deporte=${filter}`;
        const response = await fetch(`/api/equipos${query}`, { cache: "no-store" });
        const data = await response.json() as { teams?: Team[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "No se pudieron cargar los equipos.");
        setTeams(data.teams ?? []);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "No se pudieron cargar los equipos.");
      } finally {
        setLoading(false);
      }
    }

    void loadTeams();
  }, [filter]);

  function changeFilter(nextFilter: Sport) {
    setFilter(nextFilter);
    setLoading(true);
    setError("");
  }

  return (
    <main className="site-shell directory-page">
      <nav className="topbar">
        <Link className="brand" href="/" aria-label="Cancha Abierta inicio"><span className="brand-mark">CA</span><span>Cancha Abierta</span></Link>
        <Link className="directory-back" href="/">Volver a inscripciones <span>↗</span></Link>
      </nav>
      <header className="directory-header">
        <div><p className="eyebrow">Temporada 2026 <span>•</span> Registro publico</p><h1>Equipos<br /><em>inscriptos.</em></h1></div>
        <p className="directory-description">Consulta los equipos registrados y sus integrantes por disciplina.</p>
      </header>
      <section className="directory-content" aria-labelledby="teams-title">
          <div className="directory-toolbar"><div><p className="section-number">01 / LISTADO</p><h2 id="teams-title">Todos los equipos</h2></div><div className="directory-controls"><div className="filter-tabs" role="group" aria-label="Filtrar por deporte">{filters.map((item) => <button key={item.key} className={filter === item.key ? "active" : ""} onClick={() => changeFilter(item.key)}>{item.label}</button>)}</div>{filter !== "todos" && !loading && !error && <p className="filtered-count"><strong>{teams.length}</strong> {teams.length === 1 ? "equipo" : "equipos"} de {filter}</p>}</div></div>
        {loading && <div className="directory-state">Cargando equipos...</div>}
        {!loading && error && <div className="directory-state error-state" role="alert">{error}</div>}
        {!loading && !error && teams.length === 0 && <div className="directory-state">Todavia no hay equipos inscriptos en esta categoria.</div>}
        {!loading && !error && teams.length > 0 && <div className="team-grid">{teams.map((team) => <article className="team-card" key={`${team.sport}-${team.id}`}><div className="team-card-top"><span className={`sport-tag ${team.sport}`}>{team.sport}</span><span className="team-id">#{String(team.id).padStart(3, "0")}</span></div><h3>{team.name}</h3><p className="captain-line"><span>CAPITAN</span>{team.captain}</p><div className="roster"><div className="roster-heading"><span>Integrantes</span><strong>{team.members.length}</strong></div>{team.members.map((member, index) => <div className="roster-member" key={`${team.id}-${index}`}><span>0{index + 1}</span>{member}</div>)}</div></article>)}</div>}
      </section>
      <footer><span>Cancha Abierta 2026</span><span>Hecho para jugar juntos <b>+</b></span></footer>
    </main>
  );
}