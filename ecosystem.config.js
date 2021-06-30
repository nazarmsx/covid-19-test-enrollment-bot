module.exports = {
  apps : [
      {
        name: "server",
        script: "./dist/server.js",
        watch: false,
        env: {
          "NODE_ENV": "production",
        },
        log_file: 'combined.log',
      }
  ]
};