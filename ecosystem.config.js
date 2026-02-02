module.exports = {
  apps: [
    {
      name: "goal-backend",
      cwd: "./backend",
      script: "index.js",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 5000
      }
    },
    {
      name: "ngrok-tunnel",
      script: "npm",
      args: "run tunnel",
      cwd: "./backend",
      exp_backoff_restart_delay: 100,
    }
  ]
};