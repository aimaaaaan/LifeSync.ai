// Simple logger that ensures output shows in terminal
export function logReport(message: string, ...args: any[]) {
  const timestamp = new Date().toISOString();
  const output = `[${timestamp}] ${message}`;
  
  // Write to stdout directly (bypasses any buffering)
  process.stdout.write(output + '\n');
  
  if (args.length > 0) {
    process.stdout.write(JSON.stringify(args) + '\n');
  }
}

export function logReportError(message: string, ...args: any[]) {
  const timestamp = new Date().toISOString();
  const output = `[${timestamp}] ERROR: ${message}`;
  
  // Write to stderr directly
  process.stderr.write(output + '\n');
  
  if (args.length > 0) {
    process.stderr.write(JSON.stringify(args) + '\n');
  }
}
