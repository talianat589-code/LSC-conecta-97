
import { useState } from "react";

type FotogramaTrayectoria = {
  tiempoMs: number;
  cambioPostura: number;
  desplazamientoMuneca: number;
  caracteristicas: number[];
};

type Props = {
  trayectoria: FotogramaTrayectoria[];
};

const CONEXIONES_MANO = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

export default function LSCMotionTrajectoryPlayer({
  trayectoria,
}: Props) {
  const [indice, setIndice] = useState(0);

  if (!trayectoria.length) {
    return <p>No hay fotogramas para reproducir.</p>;
  }

  const indiceSeguro = Math.min(
    indice,
    trayectoria.length - 1
  );

  const actual = trayectoria[indiceSeguro];

  const puntosValidos =
    Array.isArray(actual.caracteristicas) &&
    actual.caracteristicas.length >= 63;

  const puntosMano = puntosValidos
    ? Array.from({ length: 21 }, (_, i) => ({
        x: 150 + actual.caracteristicas[i * 3] * 65,
        y: 155 + actual.caracteristicas[i * 3 + 1] * 65,
      }))
    : [];

  const maximo = Math.max(
    0.000001,
    ...trayectoria.map((f) =>
      Math.max(
        f.cambioPostura,
        f.desplazamientoMuneca
      )
    )
  );

  const obtenerPuntos = (
    campo: "cambioPostura" | "desplazamientoMuneca"
  ) =>
    trayectoria
      .map((f, i) => {
        const x =
          trayectoria.length === 1
            ? 150
            : 12 + (i / (trayectoria.length - 1)) * 276;

        const y = 88 - (f[campo] / maximo) * 70;

        return `${x},${y}`;
      })
      .join(" ");

  const puntoActualX =
    trayectoria.length === 1
      ? 150
      : 12 +
        (indiceSeguro / (trayectoria.length - 1)) * 276;

  const puntoActualY =
    88 - (actual.cambioPostura / maximo) * 70;

  return (
    <div className="motion-player">
      <h5>Reproducción de trayectoria</h5>

      <h6>Representación de la mano</h6>

      {puntosValidos ? (
        <svg
          viewBox="0 0 300 220"
          width="100%"
          role="img"
          aria-label="Representación bidimensional de los 21 puntos de la mano"
        >
          {CONEXIONES_MANO.map(([origen, destino]) => (
            <line
              key={`${origen}-${destino}`}
              x1={puntosMano[origen].x}
              y1={puntosMano[origen].y}
              x2={puntosMano[destino].x}
              y2={puntosMano[destino].y}
              stroke="#168bca"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}

          {puntosMano.map((punto, i) => (
            <circle
              key={i}
              cx={punto.x}
              cy={punto.y}
              r={i === 0 ? 6 : 4}
              fill={i === 0 ? "#e49a36" : "#168bca"}
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>
      ) : (
        <p>
          Este fotograma no contiene las 63 características
          necesarias para reconstruir la mano.
        </p>
      )}

      <p>
        Puntos de referencia disponibles:{" "}
        {puntosValidos ? 21 : 0} de 21
      </p>

      <h6>Evolución del movimiento</h6>

      <svg
        viewBox="0 0 300 110"
        width="100%"
        role="img"
        aria-label="Evolución de las métricas del movimiento"
      >
        <line x1="12" y1="18" x2="288" y2="18"
          stroke="#dce8e3" />
        <line x1="12" y1="53" x2="288" y2="53"
          stroke="#dce8e3" />
        <line x1="12" y1="88" x2="288" y2="88"
          stroke="#dce8e3" />

        <polyline
          points={obtenerPuntos("cambioPostura")}
          fill="none"
          stroke="#168bca"
          strokeWidth="2.5"
        />

        <polyline
          points={obtenerPuntos("desplazamientoMuneca")}
          fill="none"
          stroke="#e49a36"
          strokeWidth="2.5"
        />

        <line
          x1={puntoActualX}
          y1="10"
          x2={puntoActualX}
          y2="95"
          stroke="#64748b"
          strokeDasharray="3 3"
        />

        <circle
          cx={puntoActualX}
          cy={puntoActualY}
          r="5"
          fill="#168bca"
          stroke="white"
          strokeWidth="2"
        />
      </svg>

      <p>
        Fotograma {indiceSeguro + 1} de {trayectoria.length}
      </p>

      <input
        type="range"
        min={0}
        max={trayectoria.length - 1}
        value={indiceSeguro}
        onChange={(event) =>
          setIndice(Number(event.target.value))
        }
        aria-label="Seleccionar fotograma"
      />

      <div className="motion-player-controls">
        <button
          type="button"
          disabled={indiceSeguro === 0}
          onClick={() =>
            setIndice((actual) => Math.max(0, actual - 1))
          }
        >
          ← Anterior
        </button>

        <button
          type="button"
          onClick={() => setIndice(0)}
        >
          Reiniciar
        </button>

        <button
          type="button"
          disabled={indiceSeguro === trayectoria.length - 1}
          onClick={() =>
            setIndice((actual) =>
              Math.min(trayectoria.length - 1, actual + 1)
            )
          }
        >
          Siguiente →
        </button>
      </div>

      <p>
        Tiempo: {actual.tiempoMs.toFixed(0)} ms
      </p>

      <p>
        Cambio de postura: {actual.cambioPostura.toFixed(4)}
      </p>

      <p>
        Desplazamiento de muñeca:{" "}
        {actual.desplazamientoMuneca.toFixed(4)}
      </p>

      <small>
        Representación bidimensional reconstruida a partir
        de características normalizadas. No equivale a una
        reconstrucción tridimensional ni a una traducción LSC.
      </small>
    </div>
  );
}
