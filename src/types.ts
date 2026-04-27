export interface KimiUsageResponse {
  user: {
    userId: string;
    region: string;
    membership: {
      level: string;
    };
    businessId: string;
  };
  usage: {
    limit: string;
    used: string;
    remaining: string;
    resetTime: string;
  };
  limits: Array<{
    window: {
      duration: number;
      timeUnit: string;
    };
    detail: {
      limit: string;
      used: string;
      remaining: string;
      resetTime: string;
    };
  }>;
  parallel: {
    limit: string;
  };
  totalQuota: {
    limit: string;
    remaining: string;
  };
  authentication: {
    method: string;
    scope: string;
  };
  subType: string;
}

export function getRateLimitWindow(usage: KimiUsageResponse): {
  used: number;
  limit: number;
  remaining: number;
  resetTime: string;
} | null {
  const rateLimit = usage.limits.find(
    (l) => l.window.timeUnit === "TIME_UNIT_MINUTE" && l.window.duration === 300
  );
  if (!rateLimit) return null;
  const limit = parseInt(rateLimit.detail.limit, 10);
  if (limit <= 0) return null;
  return {
    used: parseInt(rateLimit.detail.used, 10),
    limit,
    remaining: parseInt(rateLimit.detail.remaining, 10),
    resetTime: rateLimit.detail.resetTime,
  };
}

export function getWeeklyUsage(usage: KimiUsageResponse): {
  used: number;
  limit: number;
  remaining: number;
  resetTime: string;
} {
  return {
    used: parseInt(usage.usage.used, 10),
    limit: parseInt(usage.usage.limit, 10),
    remaining: parseInt(usage.usage.remaining, 10),
    resetTime: usage.usage.resetTime,
  };
}

export function formatResetTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "resets soon";
  if (diffMins < 60) return `resets in ${diffMins}m`;
  const remainingMins = diffMins % 60;
  if (remainingMins === 0) return `resets in ${diffHours}h`;
  return `resets in ${diffHours}h ${remainingMins}m`;
}

export function getMembershipName(level: string): string {
  const map: Record<string, string> = {
    LEVEL_BASIC: "Basic",
    LEVEL_INTERMEDIATE: "Allegretto",
    LEVEL_ADVANCED: "Presto",
    LEVEL_ENTERPRISE: "Enterprise",
  };
  return map[level] || level.replace("LEVEL_", "");
}
