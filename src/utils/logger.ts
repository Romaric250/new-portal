type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (meta) {
      return `${prefix} ${message}\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  info(message: string, meta?: unknown): void {
    console.log(this.formatMessage('info', message, meta));
  }

  warn(message: string, meta?: unknown): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  error(message: string, error?: Error | unknown, meta?: unknown): void {
    const errorMeta = error instanceof Error 
      ? { message: error.message, stack: error.stack, ...meta }
      : { error, ...meta };
    console.error(this.formatMessage('error', message, errorMeta));
  }

  debug(message: string, meta?: unknown): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();

