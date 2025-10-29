import * as Plot from "npm:@observablehq/plot";
import {formatPercentDecimal, formatInteger} from "../../lib/formatters.js";
import {DIVERSITY_PALETTE, QUALITATIVE_PALETTE} from "../../lib/colors.js";
import {html} from "npm:htl";

/**
 * Componente de diversidad racial/étnica y lenguas con foco en insights de mercado
 */
export function DiversityLanguage({data}) {
  const diversity = data.diversity;
  const totalPop = data.kpis.population;
  
  // Calcular segmentos de mercado por tamaño absoluto
  const marketSegments = diversity.race_ethnicity.map(d => ({
    category: d.category,
    share: d.share,
    population: Math.round(totalPop * d.share),
    // Potencial de mercado foodservice (asumiendo gasto promedio por segmento)
    marketSize: d.category.includes("Hispano") ? "Alto" : 
                d.category.includes("Asiático") ? "Alto" :
                d.category.includes("Afro") ? "Medio" : "Medio-Alto"
  })).sort((a, b) => b.share - a.share);
  
  // Combinar datos de idiomas con origen de extranjeros para contexto cultural
  const culturalContext = diversity.languages.map(lang => {
    let culturalInsight = "";
    if (lang.language.includes("Español")) {
      const latinaShare = diversity.foreign_born_by_region.find(r => r.region === "América Latina").share;
      culturalInsight = `${formatPercentDecimal(latinaShare * 100, 0)} de extranjeros son de América Latina`;
    } else if (lang.language.includes("asiáticas")) {
      const asiaShare = diversity.foreign_born_by_region.find(r => r.region === "Asia").share;
      culturalInsight = `${formatPercentDecimal(asiaShare * 100, 0)} de extranjeros son de Asia`;
    }
    return {
      ...lang,
      households: Math.round(totalPop * 0.364 * lang.share), // 36.4% avg household size ~2.75
      culturalInsight
    };
  }).filter(d => d.share > 0.02); // Solo idiomas con >2% relevancia
  
  // Gráfico de segmentos de mercado (población absoluta + share)
  const marketChart = Plot.plot({
    width: 800,
    height: 400,
    marginLeft: 160,
    marginRight: 80,
    style: {
      background: "transparent",
      fontSize: "12px"
    },
    ariaLabel: "Segmentos de mercado por tamaño poblacional y diversidad en Houston MSA",
    x: {
      label: "Población (millones)",
      tickFormat: d => `${(d / 1000000).toFixed(1)}M`,
      grid: true
    },
    y: {
      label: null,
      domain: marketSegments.map(d => d.category)
    },
    color: {
      domain: marketSegments.map(d => d.category),
      range: DIVERSITY_PALETTE
    },
    marks: [
      Plot.barX(marketSegments, {
        x: "population",
        y: "category",
        fill: "category",
        tip: {
          format: {
            x: d => `${formatInteger(d)} personas (${formatPercentDecimal((d / totalPop) * 100, 1)})`,
            y: true
          }
        }
      }),
      Plot.text(marketSegments, {
        x: "population",
        y: "category",
        text: d => `${formatInteger(d.population)} | ${formatPercentDecimal(d.share * 100, 1)}`,
        dx: 45,
        textAnchor: "start",
        fill: "currentColor",
        fontSize: 11,
        fontWeight: 600
      })
    ]
  });
  
  // Gráfico combinado: Idiomas + Contexto Cultural
  const culturalChart = Plot.plot({
    width: 900,
    height: 300,
    marginLeft: 200,
    marginRight: 140,
    style: {
      background: "transparent",
      fontSize: "12px"
    },
    ariaLabel: "Idiomas hablados en el hogar y contexto cultural de origen",
    x: {
      label: "Hogares estimados (miles)",
      tickFormat: d => `${(d / 1000).toFixed(0)}K`,
      grid: true
    },
    y: {
      label: null,
      domain: culturalContext.map(d => d.language)
    },
    color: {
      type: "ordinal",
      domain: culturalContext.map(d => d.language),
      range: ["#1f77b4", "#ff7f0e", "#2ca02c", "#9467bd"]
    },
    marks: [
      Plot.barX(culturalContext, {
        x: "households",
        y: "language",
        fill: "language",
        tip: {
          format: {
            x: d => `${formatInteger(d)} hogares (${formatPercentDecimal((d / (totalPop * 0.364)) * 100, 1)})`,
            y: true
          }
        }
      }),
      Plot.text(culturalContext, {
        x: "households",
        y: "language",
        text: d => formatPercentDecimal(d.share * 100, 1),
        dx: -35,
        textAnchor: "end",
        fill: "white",
        fontSize: 11,
        fontWeight: 700
      }),
      Plot.text(culturalContext.filter(d => d.culturalInsight), {
        x: "households",
        y: "language",
        text: d => d.culturalInsight,
        dx: 50,
        textAnchor: "start",
        fill: "var(--theme-foreground-muted)",
        fontSize: 10,
        fontStyle: "italic"
      })
    ]
  });
  
  
  return html`
    <div style="margin: 2rem 0;">
      <h3 style="
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: var(--theme-foreground);
      ">Diversidad Multicultural — Análisis de Oportunidad de Mercado</h3>
      
      <p style="
        font-size: 0.95rem;
        color: var(--theme-foreground-muted);
        line-height: 1.6;
        margin-bottom: 2rem;
        max-width: 900px;
      ">
        Houston es una de las ciudades más diversas de EE.UU. Esta diversidad representa una 
        <strong>oportunidad estratégica única</strong> para conceptos culinarios auténticos y diferenciados.
        El análisis siguiente cuantifica el potencial de mercado por segmento demográfico.
      </p>
      
      <!-- KPIs de Diversidad -->
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin-bottom: 2.5rem;
      ">
        <div style="
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 8px;
          padding: 1.25rem;
          border-left: 4px solid #f59e0b;
        ">
          <div style="font-size: 0.75rem; color: #78350f; margin-bottom: 0.25rem; font-weight: 600;">
            MERCADO MULTICULTURAL
          </div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #92400e; margin-bottom: 0.25rem;">
            ${formatPercentDecimal((1 - diversity.race_ethnicity[0].share) * 100, 1)}
          </div>
          <div style="font-size: 0.8rem; color: #92400e; line-height: 1.3;">
            de la población es hispana, asiática, afroamericana u otra minoría
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 8px;
          padding: 1.25rem;
          border-left: 4px solid #ff7f0e;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem; font-weight: 600;">
            HOGARES BILINGÜES/MULTILINGÜES
          </div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #ff7f0e; margin-bottom: 0.25rem;">
            ${formatPercentDecimal((1 - diversity.languages[0].share) * 100, 1)}
          </div>
          <div style="font-size: 0.8rem; color: var(--theme-foreground-muted); line-height: 1.3;">
            hablan otros idiomas además de inglés (español ${formatPercentDecimal(diversity.languages[1].share * 100, 0)})
          </div>
        </div>
        
        <div style="
          background: var(--theme-background-alt);
          border-radius: 8px;
          padding: 1.25rem;
          border-left: 4px solid #1f77b4;
        ">
          <div style="font-size: 0.75rem; color: var(--theme-foreground-muted); margin-bottom: 0.25rem; font-weight: 600;">
            POBLACIÓN NACIDA EN EL EXTRANJERO
          </div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #1f77b4; margin-bottom: 0.25rem;">
            ${formatPercentDecimal(diversity.foreign_born * 100, 1)}
          </div>
          <div style="font-size: 0.8rem; color: var(--theme-foreground-muted); line-height: 1.3;">
            ${formatInteger(Math.round(totalPop * diversity.foreign_born))} personas con experiencia culinaria internacional
          </div>
        </div>
      </div>
      
      <!-- Segmentos de Mercado por Tamaño -->
      <h4 style="
        font-size: 1.2rem;
        font-weight: 600;
        margin: 2.5rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Segmentos de Mercado — Tamaño Poblacional</h4>
      
      <p style="
        font-size: 0.9rem;
        color: var(--theme-foreground-muted);
        line-height: 1.5;
        margin-bottom: 1rem;
        max-width: 800px;
      ">
        Cuantificación de cada segmento demográfico en números absolutos. El tamaño de mercado es crítico 
        para planificación de capacidad, producción y estrategia de distribución.
      </p>
      
      ${marketChart}
      
      <!-- Contexto Cultural por Idioma -->
      <h4 style="
        font-size: 1.2rem;
        font-weight: 600;
        margin: 2.5rem 0 1rem 0;
        color: var(--theme-foreground);
      ">Contexto Cultural y Lingüístico de Hogares</h4>
      
      <p style="
        font-size: 0.9rem;
        color: var(--theme-foreground-muted);
        line-height: 1.5;
        margin-bottom: 1rem;
        max-width: 800px;
      ">
        Los idiomas hablados en el hogar revelan contexto cultural y preferencias culinarias. 
        Esta información es clave para estrategias de producto, marketing y comunicación.
      </p>
      
      ${culturalChart}
      
      <!-- Insights Estratégicos -->
      <div style="
        margin-top: 2rem;
        padding: 1.5rem;
        background: var(--theme-background-alt);
        border-radius: 8px;
        font-size: 0.9rem;
        line-height: 1.7;
        color: var(--theme-foreground);
      ">
        <h5 style="
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--theme-foreground);
        ">🎯 Insights Estratégicos Clave</h5>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
          <div>
            <div style="font-weight: 700; color: #ff7f0e; margin-bottom: 0.5rem;">
              1. Segmento Hispano/Latino (${formatPercentDecimal(marketSegments[0].share * 100, 1)} | ${formatInteger(marketSegments[0].population)} personas)
            </div>
            <ul style="margin: 0.25rem 0 0 1.5rem; color: var(--theme-foreground-muted);">
              <li><strong>Oportunidad:</strong> Muy Alta. Mayor tamaño + altísima afinidad cultural con pastes.</li>
              <li><strong>Estrategia:</strong> Enfoque en autenticidad, recetas tradicionales, nostalgia.</li>
              <li><strong>Canales:</strong> Marketing en español, eventos comunitarios, redes sociales hispanas.</li>
              <li><strong>Awareness:</strong> Actualmente baja (25%) — gran potencial de crecimiento.</li>
            </ul>
          </div>
          
          <div>
            <div style="font-weight: 700; color: #1f77b4; margin-bottom: 0.5rem;">
              2. Segmento Blanco no Hispano (${formatPercentDecimal(marketSegments[1].share * 100, 1)} | ${formatInteger(marketSegments[1].population)} personas)
            </div>
            <ul style="margin: 0.25rem 0 0 1.5rem; color: var(--theme-foreground-muted);">
              <li><strong>Oportunidad:</strong> Alta. Segundo mayor tamaño, buen interés en ethnic food.</li>
              <li><strong>Estrategia:</strong> Posicionar como "comfort food mexicano" premium y auténtico.</li>
              <li><strong>Canales:</strong> Redes sociales (Instagram/TikTok), food halls, eventos corporativos.</li>
              <li><strong>Awareness:</strong> Muy baja (10%) — requiere educación de mercado y sampling.</li>
            </ul>
          </div>
          
          <div>
            <div style="font-weight: 700; color: #9467bd; margin-bottom: 0.5rem;">
              3. Segmento Asiático (${formatPercentDecimal(marketSegments.find(s => s.category.includes("Asiático")).share * 100, 1)} | ${formatInteger(marketSegments.find(s => s.category.includes("Asiático")).population)} personas)
            </div>
            <ul style="margin: 0.25rem 0 0 1.5rem; color: var(--theme-foreground-muted);">
              <li><strong>Oportunidad:</strong> Alta. Alta apertura a diversidad culinaria y experiencias nuevas.</li>
              <li><strong>Estrategia:</strong> Emphasize craftsmanship, ingredients, story. Fusiones creativas.</li>
              <li><strong>Canales:</strong> Áreas con alta concentración asiática (Sugar Land, West Houston).</li>
              <li><strong>Awareness:</strong> Baja (15%) — potencial para early adopters y word-of-mouth.</li>
            </ul>
          </div>
          
          <div>
            <div style="font-weight: 700; color: #2ca02c; margin-bottom: 0.5rem;">
              4. Comunicación Multicultural
            </div>
            <ul style="margin: 0.25rem 0 0 1.5rem; color: var(--theme-foreground-muted);">
              <li><strong>Español esencial:</strong> ${formatPercentDecimal(diversity.languages[1].share * 100, 0)} de hogares hablan español.</li>
              <li><strong>Menús bilingües:</strong> Inglés/Español como estándar para maximizar accesibilidad.</li>
              <li><strong>Marketing digital:</strong> Contenido en ambos idiomas, influencers bilingües.</li>
              <li><strong>Empaque y señalética:</strong> Considerar bilingual branding desde el inicio.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

