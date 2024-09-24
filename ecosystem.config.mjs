// ecosystem.config.mjs
require( default {
  apps: [
    {
      name: 'app',
      script: 'app.js',
      watch: ['src', 'config'], // Only watch specific directories
      ignore_watch: ['node_modules', 'logs', 'tmp'], // Ignore unnecessary directories
    }
  ]
})
