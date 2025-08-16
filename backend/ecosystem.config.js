module.exports = {
  apps: [
    {
      name: 'agriconnect-backend',
      script: './dist/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Process management
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Environment variables
      env_file: '.env',
      
      // Advanced settings
      node_args: '--max-old-space-size=1024',
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Error handling
      autorestart: true,
      exp_backoff_restart_delay: 100,
      
      // Performance
      instance_var: 'INSTANCE_ID',
      merge_logs: true,
      
      // Security
      uid: 'nodejs',
      gid: 'nodejs',
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/agriconnect.git',
      path: '/opt/agriconnect',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
