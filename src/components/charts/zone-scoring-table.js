import { html } from "npm:htl";

/**
 * Tabla de scoring para comparación de zonas con codificación de colores
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.zones - Array de objetos con datos de zonas
 * @param {Array} options.criteria - Array de criterios con weights
 * @param {string} options.title - Título de la tabla
 * @returns {HTMLElement} Tabla HTML
 */
export function zoneScoringTable({
	zones = [],
	criteria = [],
	title = "Comparación de Zonas"
} = {}) {
	
	// Función para obtener color basado en score (0-10)
	function getScoreColor(score) {
		if (score >= 8) return "#22c55e"; // Verde
		if (score >= 6) return "#eab308"; // Amarillo
		if (score >= 4) return "#f97316"; // Naranja
		return "#ef4444"; // Rojo
	}

	// Función para calcular score total ponderado
	function calculateTotalScore(zone) {
		let total = 0;
		criteria.forEach(criterion => {
			const score = zone[criterion.key] || 0;
			const weight = criterion.weight / 100;
			total += score * weight;
		});
		return total;
	}

	// Calcular scores totales
	const zonesWithTotal = zones.map(zone => ({
		...zone,
		totalScore: calculateTotalScore(zone)
	}));

	// Ordenar por score total descendente
	zonesWithTotal.sort((a, b) => b.totalScore - a.totalScore);

	return html`
		<div style="
			background: var(--theme-background-alt);
			border-radius: 8px;
			padding: 1.5rem;
			overflow-x: auto;
		">
			<h3 style="
				margin: 0 0 1.5rem 0;
				font-size: 1.25rem;
				font-weight: 600;
				color: var(--theme-foreground);
			">${title}</h3>
			
			<table style="
				width: 100%;
				border-collapse: collapse;
				font-size: 0.875rem;
				table-layout: fixed;
			">
				<thead>
					<tr style="background: var(--theme-background);">
						<th style="
							padding: 1rem 0.75rem;
							text-align: left;
							font-weight: 600;
							border-bottom: 2px solid var(--theme-foreground-faintest);
							width: 20%;
						">Zona</th>
						${criteria.map(criterion => html`
							<th style="
								padding: 1rem 0.5rem;
								text-align: center;
								font-weight: 600;
								border-bottom: 2px solid var(--theme-foreground-faintest);
								width: ${80 / (criteria.length + 1)}%;
								vertical-align: bottom;
							">
								<div style="font-size: 0.9rem; margin-bottom: 0.25rem;">${criterion.label}</div>
								<div style="
									font-size: 0.75rem;
									font-weight: 400;
									color: var(--theme-foreground-muted);
								">(${criterion.weight}%)</div>
							</th>
						`)}
						<th style="
							padding: 1rem 0.5rem;
							text-align: center;
							font-weight: 700;
							border-bottom: 2px solid var(--theme-foreground-faintest);
							background: var(--theme-background-alt);
							width: ${80 / (criteria.length + 1)}%;
							vertical-align: bottom;
						">
							<div style="font-size: 0.9rem;">Score</div>
							<div style="font-size: 0.9rem;">Total</div>
						</th>
					</tr>
				</thead>
				<tbody>
					${zonesWithTotal.map((zone, idx) => html`
						<tr style="
							border-bottom: 1px solid var(--theme-foreground-faintest);
							${idx === 0 ? 'background: rgba(34, 197, 94, 0.05);' : ''}
						">
							<td style="
								padding: 1rem 0.75rem;
								font-weight: 600;
								color: var(--theme-foreground);
								font-size: 0.85rem;
							">
								${idx === 0 ? '🏆 ' : ''}${zone.name}
							</td>
							${criteria.map(criterion => {
								const score = zone[criterion.key] || 0;
								const color = getScoreColor(score);
								return html`
									<td style="
										padding: 0.75rem 0.5rem;
										text-align: center;
									">
										<div style="
											display: inline-block;
											padding: 0.4rem 0.8rem;
											border-radius: 4px;
											background: ${color}15;
											color: ${color};
											font-weight: 700;
											border: 1px solid ${color}40;
											font-size: 0.95rem;
											min-width: 45px;
										">
											${score.toFixed(1)}
										</div>
									</td>
								`;
							})}
							<td style="
								padding: 0.75rem 0.5rem;
								text-align: center;
								background: var(--theme-background-alt);
							">
								<div style="
									display: inline-block;
									padding: 0.5rem 1.2rem;
									border-radius: 6px;
									background: ${getScoreColor(zone.totalScore)};
									color: white;
									font-weight: 700;
									font-size: 1.1rem;
									min-width: 50px;
								">
									${zone.totalScore.toFixed(1)}
								</div>
							</td>
						</tr>
					`)}
				</tbody>
			</table>
			
			<div style="
				margin-top: 1.5rem;
				padding: 0.75rem;
				background: var(--theme-background);
				border-radius: 4px;
				font-size: 0.75rem;
				color: var(--theme-foreground-muted);
			">
				<strong>Escala de scoring:</strong> 
				<span style="color: #22c55e; margin-left: 0.5rem;">■ 8-10 Excelente</span>
				<span style="color: #eab308; margin-left: 0.5rem;">■ 6-7.9 Bueno</span>
				<span style="color: #f97316; margin-left: 0.5rem;">■ 4-5.9 Aceptable</span>
				<span style="color: #ef4444; margin-left: 0.5rem;">■ 0-3.9 Deficiente</span>
			</div>
		</div>
	`;
}

/**
 * Gráfica de barras comparativa para demografía por zona
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.zones - Array con datos demográficos por zona
 * @returns {HTMLElement} Elemento de visualización
 */
export function demographicsComparisonChart({
	zones = [],
	width = 640
} = {}) {
	const Plot = window.Plot;
	
	// Preparar datos para el gráfico
	const chartData = zones.flatMap(zone => [
		{ zone: zone.name, metric: "% Población Blanca", value: zone.whitePercent || 0 },
		{ zone: zone.name, metric: "Ingreso Medio ($k)", value: (zone.medianIncome || 0) / 1000 }
	]);

	return Plot.plot({
		width,
		height: 300,
		marginLeft: 200,
		style: {
			background: "transparent",
			fontSize: "12px"
		},
		x: {
			grid: true,
			label: "Valor"
		},
		y: {
			label: null
		},
		color: {
			domain: ["% Población Blanca", "Ingreso Medio ($k)"],
			range: ["#3b82f6", "#22c55e"]
		},
		marks: [
			Plot.barX(chartData, {
				x: "value",
				y: "zone",
				fill: "metric",
				sort: { y: "-x", limit: 5 },
				tip: true
			}),
			Plot.ruleX([0])
		],
		facet: {
			data: chartData,
			y: "metric",
			marginLeft: 200
		}
	});
}

