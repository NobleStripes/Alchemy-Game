import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { collections, elements, eras, recipes } from './src/game/content/index.ts'
import { getGraphMetrics } from './src/game/engine/elementStatus.ts'
import { validateContent } from './src/game/engine/validateContent.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'validate-recipe-graph',
    apply: 'build',
    buildStart() {
      const errors = validateContent(elements, recipes, eras, collections)
      if (errors.length) this.error(errors.join('\n'))
      const metrics = getGraphMetrics(elements, recipes)
      console.info(`Recipe graph: ${metrics.total} total elements: ${metrics.ingredients} crafting ingredients, ${metrics.terminal} terminal elements, ${metrics.unused} unused nodes.`)
    },
  }],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /[\\/]node_modules[\\/]/ },
          ],
        },
      },
    },
  },
})
