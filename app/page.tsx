"use client";

import { FormEvent, useState } from "react";

type Sport = "voley" | "futbol";

const sports = {
  voley: { label: "Voley", detail: "6 integrantes", accent: "coral", icon: "V" },
  futbol: { label: "Futbol", detail: "5 integrantes", accent: "blue", icon: "F" },
} as const;

export default function Home() {
  const [sport, setSport] = useState<Sport>("voley");
  const [submitted, setSubmitted] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainName, setCaptainName] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const memberCount = sport === "voley" ? 6 : 5;
  const [members, setMembers] = useState<string[]>(Array(memberCount).fill(""));

  const handleMemberChange = (index: number, value: string) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value;
    setMembers(updatedMembers);

    if (index === 0) {
      setCaptainName(value);
    }
  };

  async function ingresarEquipo() {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/equipos/${sport === "voley" ? "Voley" : "Futbol"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamName,
          sport,
          captainName,
          captainEmail,
          members, 
        }),
      });

      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "No se pudo registrar el equipo.");
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo registrar el equipo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ingresarEquipo();
  }

  return (
    <main className="site-shell">
      <nav className="topbar">
        <a className="brand" href="#inicio" aria-label="Cancha Abierta inicio">
          <span className="brand-mark">CA</span>
          <span>Cancha Abierta</span>
        </a>
        <a className="directory-back" href="/inscriptos">Ver equipos inscriptos <span>↗</span></a>
      </nav>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Torneo interbarrial <span>•</span> Inscripciones abiertas</p>
          <h1>El equipo empieza<br /><em>con vos.</em></h1>
          <p className="hero-text">Arma tu equipo, elegi tu deporte y ven a jugar por algo mas que un resultado.</p>
          <div className="hero-meta"><span className="meta-icon">01</span><span>Inscripciones hasta el 4 de septiembre</span></div>
        </div>
      </section>

      <section className="registration-layout" aria-labelledby="registration-title">
        <div className="form-intro">
          <p className="section-number">01 / 03</p>
          <h2 id="registration-title">Inscribi a<br />tu equipo</h2>
          <p>Completa los datos y asegura tu lugar en la cancha.</p>
          <div className="progress-line"><span /></div>
          <p className="required-note"><span>*</span> Campos obligatorios</p>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Elegir deporte</legend>
            <div className="sport-options">
              {(Object.keys(sports) as Sport[]).map((key) => {
                const item = sports[key];
                return <button type="button" key={key} className={`sport-card ${sport === key ? "selected" : ""} ${item.accent}`} onClick={() => { setSport(key); setMembers(Array(key === "voley" ? 6 : 5).fill("")); setSubmitted(false); setErrorMessage(""); }} aria-pressed={sport === key}>
                  <span className="sport-icon">{item.icon}</span><span className="sport-info"><strong>{item.label}</strong><small>{item.detail}</small></span><span className="radio-mark" />
                </button>;
              })}
            </div>
          </fieldset>

          <div className="field-grid">
            <label>Nombre del equipo <span>*</span><input required value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Ej. Equipo 1" /></label>
          </div>
          <div className="form-divider" />
          <div className="captain-heading"><div><p className="mini-label">Responsable del equipo</p><h3>Datos del capitan</h3></div><span className="captain-badge">CAPITAN</span></div>
          <div className="field-grid">
            <label>Nombre completo <span>*</span><input required value={captainName} onChange={(event) => handleMemberChange(0, event.target.value)} placeholder="Nombre y apellido" /></label>
            <label>Correo electronico <span>*</span><input required type="email" value={captainEmail} onChange={(event) => setCaptainEmail(event.target.value)} placeholder="nombre@correo.com" /></label>
          </div>
          
          <div className="members-heading"><div><p className="mini-label">Integrantes</p><h3>Lista del equipo</h3></div><span className="count-badge">{memberCount} lugares</span></div>
          
          <div className="members-list">
            {members.map((memberValue, index) => (
              <label className="member-row" key={`${sport}-${index}`}>
                <span className="member-number">0{index + 1}</span>
                <input 
                  required 
                  placeholder={index === 0 ? "Nombre del capitan" : "Nombre completo del jugador"} 
                  value={memberValue}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                />
                <span className="member-check" />
              </label>
            ))}
          </div>

          <label className="terms"><input required type="checkbox" /><span>Acepto las condiciones de participacion y el reglamento del torneo.</span></label>
          {submitted ? <div className="success-message" role="status">Equipo registrado. Recibimos la inscripcion de {teamName || "tu equipo"}.</div> : <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando equipo..." : "Confirmar inscripcion"} <span>↗</span></button>}
          {errorMessage && <div className="error-message" role="alert">{errorMessage}</div>}
          <p className="privacy-note">Tus datos solo seran usados para coordinar el torneo.</p>
        </form>
      </section>
      <footer><span>Cancha Abierta 2026</span><span>Hecho para jugar juntos <b>+</b></span></footer>
    </main>
  );
}
