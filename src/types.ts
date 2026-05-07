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

function safeParseInt(str: string): number | null {
  const n = parseInt(str, 10);
  return isNaN(n) ? null : n;
}

export function getRateLimitWindow(usage: KimiUsageResponse): {
  used: number | null;
  limit: number | null;
  remaining: number | null;
  resetTime: string;
} | null {
  const rateLimit = usage.limits.find(
    (l) => l.window.timeUnit === "TIME_UNIT_MINUTE" && l.window.duration === 300
  );
  if (!rateLimit) return null;
  const limit = safeParseInt(rateLimit.detail.limit);
  if (limit === null || limit <= 0) return null;
  return {
    used: safeParseInt(rateLimit.detail.used),
    limit,
    remaining: safeParseInt(rateLimit.detail.remaining),
    resetTime: rateLimit.detail.resetTime,
  };
}

export function getWeeklyUsage(usage: KimiUsageResponse): {
  used: number | null;
  limit: number | null;
  remaining: number | null;
  resetTime: string;
} {
  return {
    used: safeParseInt(usage.usage.used),
    limit: safeParseInt(usage.usage.limit),
    remaining: safeParseInt(usage.usage.remaining),
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
  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;
    const remMins = diffMins % 60;
    return `resets in ${days}d ${remHours}h ${remMins}m`;
  }
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
