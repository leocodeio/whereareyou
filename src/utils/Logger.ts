// Centralized logging utility
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  private static instance: Logger;
  private logs: string[] = [];
  private maxLogs = 1000;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, agent: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level} [${agent}] ${message}${contextStr}`;
  }

  debug(agent: string, message: string, context?: any): void {
    const formatted = this.formatMessage(LogLevel.DEBUG, agent, message, context);
    console.debug(formatted);
    this.addLog(formatted);
  }

  info(agent: string, message: string, context?: any): void {
    const formatted = this.formatMessage(LogLevel.INFO, agent, message, context);
    console.info(formatted);
    this.addLog(formatted);
  }

  warn(agent: string, message: string, context?: any): void {
    const formatted = this.formatMessage(LogLevel.WARN, agent, message, context);
    console.warn(formatted);
    this.addLog(formatted);
  }

  error(agent: string, message: string, error?: Error, context?: any): void {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
    const formatted = this.formatMessage(LogLevel.ERROR, agent, message, errorContext);
    console.error(formatted);
    this.addLog(formatted);
  }

  private addLog(log: string): void {
    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = Logger.getInstance();