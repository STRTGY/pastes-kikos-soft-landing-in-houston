# 🔄 Flujo de Reactividad - Control Panel

## Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    PÁGINA: valor.md                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 1: Crear Inputs (Objetos DOM)                             │
├─────────────────────────────────────────────────────────────────┤
│  const priceInput = Inputs.checkbox([...])                      │
│  const categoryInput = Inputs.select([...])                     │
│  const mixInput = Inputs.range([...])                           │
│  const coverageInput = Inputs.range([...])                      │
│  const priceWeightInput = Inputs.range([...])                   │
│  const sentimentWeightInput = Inputs.range([...])               │
│  const flavourWeightInput = Inputs.range([...])                 │
│  const flavoursInput = Inputs.checkbox([...])                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 2: Binding Reactivo con view()                            │
├─────────────────────────────────────────────────────────────────┤
│  const priceScenarios = view(priceInput)         ◄─────┐        │
│  const selectedCategoryFit = view(categoryInput) ◄─────┤        │
│  const weightMenuFit = view(mixInput)            ◄─────┤        │
│  const minCoverage = view(coverageInput)         ◄─────┤        │
│  const weightPrice = view(priceWeightInput)      ◄─────┤        │
│  const weightSentiment = view(sentimentWeightInput) ◄──┤        │
│  const weightFlavour = view(flavourWeightInput)  ◄─────┤        │
│  const targetFlavours = view(flavoursInput)      ◄─────┤        │
│                                                         │        │
│  VARIABLES REACTIVAS: se actualizan cuando ────────────┘        │
│  el usuario interactúa con los controles                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 3: Renderizar Control Panel                               │
├─────────────────────────────────────────────────────────────────┤
│  display(ControlPanel({                                          │
│    priceInput,              ◄── Inputs DOM                       │
│    categoryInput,           ◄── Inputs DOM                       │
│    ...otros inputs DOM,     ◄── Inputs DOM                       │
│    weightPrice,             ◄── Valores actuales (validación)   │
│    weightSentiment,         ◄── Valores actuales (validación)   │
│    weightFlavour            ◄── Valores actuales (validación)   │
│  }))                                                             │
│                                                                  │
│  Este bloque se RE-EJECUTA cuando cambian:                      │
│  - weightPrice                                                   │
│  - weightSentiment                                               │
│  - weightFlavour                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           COMPONENTE: ControlPanel.js                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Recibe los inputs DOM y los inserta en el HTML              │
│  2. Calcula: totalWeight = weightPrice + weightSentiment +      │
│              weightFlavour                                       │
│  3. Muestra indicador: "Total: XX% ✓/⚠️"                        │
│  4. Retorna HTML con estructura visual                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 4: Cálculos Dependientes (se re-ejecutan automáticamente) │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  mixedValue() ◄────── weightMenuFit                             │
│  filterData() ◄────── selectedCategoryFit, minCoverage          │
│                                                                  │
│  marketPriceStats ◄── filterData(), mixedValue()                │
│                                                                  │
│  priceFitScore ◄───── priceScenarios, marketPriceStats          │
│  sentimentFitScore ◄─ reviews (estático)                        │
│  flavourFitScore ◄─── targetFlavours, flavourStats              │
│                                                                  │
│  normWeightPrice ◄──── weightPrice                              │
│  normWeightSentiment ◄─ weightSentiment                         │
│  normWeightFlavour ◄─── weightFlavour                           │
│                                                                  │
│  marketFitScore ◄───── normWeightPrice, normWeightSentiment,    │
│                        normWeightFlavour, priceFitScore,        │
│                        sentimentFitScore, flavourFitScore       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PASO 5: Visualizaciones (se actualizan automáticamente)        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 Gráfico de Precios ◄──── marketPriceStats, priceScenarios   │
│  📊 Gráfico de Sentimientos ◄─ reviews                          │
│  📊 Gráfico de Aspectos ◄──── reviews                           │
│  📊 Gráfico de Sabores ◄───── targetFlavours, flavourStats      │
│  📊 Análisis de Sensibilidad ◄ normWeights, scores              │
│                                                                  │
│  🎯 ValorFitAnalysis Component ◄─ TODOS los valores             │
│                                                                  │
│  📈 KPIs y Métricas ◄───────── marketFitScore, scores           │
│  📋 Recomendaciones ◄───────── marketFitScore, scores           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🎬 Ejemplo de Interacción

### Acción del Usuario:
```
Usuario mueve slider "Peso Precio" de 40 a 50
```

### Cascada de Actualizaciones:

```
1. ⚡ Input DOM detecta cambio
      │
      ▼
2. 🔄 Observable actualiza: weightPrice = 50
      │
      ▼
3. 🎨 ControlPanel se re-renderiza
      ├─ Recalcula: totalWeight = 50 + 40 + 20 = 110
      ├─ Actualiza indicador: "Total: 110% ⚠️ Debe sumar 100%"
      └─ Actualiza color: amarillo
      │
      ▼
4. 🧮 Cálculos dependientes se re-ejecutan
      ├─ effectiveWeightPrice = 50
      ├─ effectiveTotalWeight = 110
      ├─ normWeightPrice = (50/110) × 100 = 45.45%
      ├─ normWeightSentiment = (40/110) × 100 = 36.36%
      └─ normWeightFlavour = (20/110) × 100 = 18.18%
      │
      ▼
5. 📊 marketFitScore se recalcula
      marketFitScore = (45.45/100) × priceFitScore +
                       (36.36/100) × sentimentFitScore +
                       (18.18/100) × flavourFitScore
      = NUEVO VALOR
      │
      ▼
6. 🎯 Todas las visualizaciones se actualizan
      ├─ Análisis de Sensibilidad (muestra nuevo escenario)
      ├─ ValorFitAnalysis (recalcula todo)
      ├─ Recomendaciones (ajusta mensajes)
      └─ KPIs (actualiza valores)
```

**Tiempo total**: < 100ms (gracias a la reactividad de Observable)

## 🔑 Conceptos Clave

### 1. Separación Input/Value
```javascript
// ❌ MAL: Duplicación y pérdida de reactividad
const priceScenarios = view(Inputs.checkbox([...]));
display(Inputs.checkbox([...])); // Segundo control desconectado

// ✅ BIEN: Único input, reactividad preservada
const priceInput = Inputs.checkbox([...]);
const priceScenarios = view(priceInput);
display(ControlPanel({ priceInput })); // Muestra el MISMO control
```

### 2. Dependencias Implícitas
```javascript
// Observable detecta automáticamente que este bloque depende de:
const marketFitScore = (
  (normWeightPrice / 100) * priceFitScore +
  (normWeightSentiment / 100) * sentimentFitScore +
  (normWeightFlavour / 100) * flavourFitScore
);
// ↑ normWeightPrice, normWeightSentiment, normWeightFlavour,
//   priceFitScore, sentimentFitScore, flavourFitScore
```

Cuando cualquiera de estas variables cambia, `marketFitScore` se recalcula automáticamente.

### 3. Re-renderizado Inteligente
```javascript
display(ControlPanel({
  priceInput,           // No reactivo (DOM node)
  weightPrice,          // Reactivo (valor)
  weightSentiment,      // Reactivo (valor)
  weightFlavour         // Reactivo (valor)
}));
```

Observable **solo** re-ejecuta este bloque cuando cambian `weightPrice`, `weightSentiment` o `weightFlavour`. Los inputs DOM no causan re-renderizado del componente (solo actualizan sus valores internos).

## ✅ Verificación de Integración

### Checklist para confirmar que todo está conectado:

- [x] Inputs creados con `Inputs.*` (sin `view()`)
- [x] Variables reactivas creadas con `view(input)`
- [x] Componente recibe inputs DOM y valores actuales
- [x] Cálculos usan las variables reactivas
- [x] Visualizaciones usan los resultados de cálculos
- [x] Cambiar un control actualiza todo el dashboard
- [x] Indicador "Total: X%" se actualiza en tiempo real
- [x] Sin duplicación de controles en la UI

## 🎯 Resultado Final

✅ **Interactividad completa**: Cambios en cualquier control se propagan automáticamente  
✅ **Performance óptimo**: Solo se recalcula lo necesario  
✅ **Código limpio**: Separación clara entre presentación y lógica  
✅ **Mantenible**: Fácil agregar nuevos controles o modificar existentes  
✅ **Sin bugs**: No hay conflictos entre inputs duplicados o valores desincronizados

