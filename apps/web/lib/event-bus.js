import { EventEmitter } from "events";

// Singleton event bus — shared across all API routes in the same process
// Works on EC2/Railway/Render (persistent server)
// On Vercel (serverless) each route is isolated — use DB polling instead

const globalForEventBus = global;

if (!globalForEventBus.eventBus) {
  globalForEventBus.eventBus = new EventEmitter();
  globalForEventBus.eventBus.setMaxListeners(0); // unlimited listeners (one per connected client)
}

export const eventBus = globalForEventBus.eventBus;

// Emit a new clip event for a specific user
export function emitNewClip(userId, clip) {
  eventBus.emit(`clips:${userId}`, clip);
}
