# ControlPanel Component - Documentation

## 📋 Overview

`ControlPanel.js` es un componente visual que organiza los controles interactivos del análisis de Fit de Oferta de Valor, manteniendo la reactividad completa con el resto del dashboard.

## 🔄 Flujo de Reactividad

### En la página Markdown (valor.md):

```javascript
// 1. Crear inputs (objetos DOM)
const priceInput = Inputs.checkbox([...], {...});
const weightPriceInput = Inputs.range([...], {...});
// ... otros inputs

// 2. Bind reactivo con view()
const priceScenarios = view(priceInput);      // Variable reactiva
const weightPrice = view(weightPriceInput);   // Variable reactiva
// ... otras variables

// 3. Renderizar componente (se re-ejecuta cuando cambian los valores)
display(ControlPanel({
  priceInput,           // Input DOM para mostrar
  weightPriceInput,     // Input DOM para mostrar
  weightPrice,          // Valor actual para validación
  weightSentiment,      // Valor actual para validación
  weightFlavour         // Valor actual para validación
}));
```

### ¿Qué sucede cuando el usuario interactúa?

1. **Usuario mueve un slider** (ej: Peso Precio de 40 a 50)
2. **Observable detecta el cambio** en el input DOM
3. **La variable reactiva se actualiza** (`weightPrice = 50`)
4. **Todas las celdas dependientes se re-ejecutan**:
   - El bloque `display(ControlPanel(...))` se re-renderiza → actualiza indicador "Total: 90% ⚠️"
   - Los cálculos de scores (`priceFitScore`, `marketFitScore`, etc.) se recalculan
   - Los gráficos y visualizaciones se actualizan automáticamente
   - El componente `ValorFitAnalysis` recibe los nuevos valores y se re-renderiza

## 🎨 Estructura Visual

```
┌─────────────────────────────────────────────────────┐
│  ⚙️ Controles de Análisis                           │
├──────────────────────┬──────────────────────────────┤
│ 💰 Escenarios y      │ ⚖️ Pesos de Componentes      │
│    Fuentes           │                               │
│                      │ [Total: 100% ✓]               │
│ ☐ Precios (2 pzas)   │                               │
│ 🔽 Categoría         │ ━━━━━━●─ Peso Precio         │
│ ━━━●━━━ Mezcla       │ ━━━━━━●─ Peso Sentimiento    │
│ ━━●━━━━ Cobertura    │ ━━●━━━━━ Peso Sabor          │
│                      │                               │
│                      │ ☐ Sabores objetivo           │
└──────────────────────┴──────────────────────────────┘
│ 💡 Tip: Los cambios se reflejan automáticamente     │
└─────────────────────────────────────────────────────┘
```

## 📦 Props del Componente

### Input Elements (DOM):
- `priceInput` - Checkbox de escenarios de precio
- `categoryInput` - Select de categoría
- `mixInput` - Range de mezcla de fuentes
- `coverageInput` - Range de cobertura mínima
- `priceWeightInput` - Range de peso precio
- `sentimentWeightInput` - Range de peso sentimiento
- `flavourWeightInput` - Range de peso sabor
- `flavoursInput` - Checkbox de sabores objetivo

### Current Values (para validación reactiva):
- `weightPrice` - Valor actual del peso precio
- `weightSentiment` - Valor actual del peso sentimiento
- `weightFlavour` - Valor actual del peso sabor

## ✅ Validación

El componente calcula `totalWeight = weightPrice + weightSentiment + weightFlavour` y muestra:

- ✓ **Verde** si suma 100% → `"Total: 100% ✓"`
- ⚠️ **Amarillo** si no suma 100% → `"Total: 85% ⚠️ Debe sumar 100%"`

Este indicador se actualiza **en tiempo real** mientras el usuario ajusta los sliders.

## 🔗 Integración con el Dashboard

Las variables reactivas (`priceScenarios`, `weightPrice`, etc.) se usan en:

1. **Cálculos de scores**:
   - `priceFitScore` - Usa `priceScenarios` y `minCoverage`
   - `marketFitScore` - Usa `normWeightPrice`, `normWeightSentiment`, `normWeightFlavour`
   - `flavourFitScore` - Usa `targetFlavours`

2. **Filtrado de datos**:
   - `filterData()` - Usa `selectedCategoryFit` y `minCoverage`
   - `mixedValue()` - Usa `weightMenuFit`

3. **Visualizaciones**:
   - Todos los gráficos de Plot.js
   - Componente `ValorFitAnalysis`
   - Tablas y métricas

## 🚀 Ventajas del Enfoque

1. **Separación de concerns**: Presentación (componente) vs lógica reactiva (página)
2. **Sin duplicación**: Los inputs se crean una vez y se usan tanto en el componente como en `view()`
3. **Performance**: Observable solo re-renderiza lo necesario
4. **Mantenibilidad**: Cambios visuales en el componente, lógica en la página
5. **Reutilizable**: El componente puede usarse en otras páginas pasando diferentes inputs

## 🐛 Troubleshooting

### Problema: Los gráficos no se actualizan
**Causa**: Las variables reactivas no están declaradas con `view()`
**Solución**: Verificar que todas las variables usen `const x = view(input)` antes de `display(ControlPanel(...))`

### Problema: El indicador "Total" no se actualiza
**Causa**: Los valores `weightPrice`, `weightSentiment`, `weightFlavour` no se pasan al componente
**Solución**: Asegurar que estos valores estén en las props del componente

### Problema: Los inputs se muestran dos veces
**Causa**: Se está usando `view(input)` y también pasando el input al componente
**Solución**: Crear input → hacer view() → pasar ambos al componente (correcto)

## 📝 Notas de Implementación

- **Observable Framework versión**: Compatible con todas las versiones recientes
- **Dependencias**: `npm:htl` (HTML template literal)
- **Bloques JS necesarios**: 3 bloques separados (crear inputs, bind view, display componente)
- **Orden importa**: Los bloques deben ejecutarse en orden (Observable lo maneja automáticamente)

