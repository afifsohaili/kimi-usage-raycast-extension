import { MenuBarExtra, openExtensionPreferences, open, getPreferenceValues, Icon, Color } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { KimiUsageResponse, getRateLimitWindow, getWeeklyUsage, formatResetTime } from "./types";

interface Preferences {
  apiKey: string;
  baseUrl: string;
}

function getUsageColor(used: number | null, limit: number | null): Color {
  if (used === null || limit === null || limit <= 0) return Color.PrimaryText;
  const pct = used / limit;
  if (pct >= 0.9) return Color.Red;
  if (pct >= 0.7) return Color.Orange;
  if (pct >= 0.5) return Color.Yellow;
  return Color.Green;
}

function formatPct(used: number | null, limit: number | null): string {
  if (used === null || limit === null || limit <= 0) return "--";
  return `${Math.round((used / limit) * 100)}%`;
}

export default function Command() {
  const prefs = getPreferenceValues<Preferences>();
  const baseUrl = prefs.baseUrl || "https://api.kimi.com/coding/v1";

  const { isLoading, data, revalidate } = useFetch<KimiUsageResponse>(`${baseUrl}/usages`, {
    headers: {
      Authorization: `Bearer ${prefs.apiKey}`,
    },
    keepPreviousData: true,
  });

  const KIMI_ICON = "kimi-icon-16.png";

  if (isLoading && !data) {
    return <MenuBarExtra icon={KIMI_ICON} title="Kimi..." isLoading />;
  }

  if (!data) {
    return (
      <MenuBarExtra icon={KIMI_ICON} title="Kimi: --">
        <MenuBarExtra.Item title="Failed to load usage" icon={Icon.ExclamationMark} />
        <MenuBarExtra.Separator />
        <MenuBarExtra.Item title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
        <MenuBarExtra.Item title="Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
      </MenuBarExtra>
    );
  }

  const weekly = getWeeklyUsage(data);
  const rateLimit = getRateLimitWindow(data);

  // Menu bar title shows rate limit percentage or weekly if no rate limit
  let title: string;
  if (rateLimit) {
    title = formatPct(rateLimit.used, rateLimit.limit);
  } else {
    title = formatPct(weekly.used, weekly.limit);
  }

  return (
    <MenuBarExtra icon={KIMI_ICON} title={title} isLoading={isLoading}>
      {rateLimit && (
        <MenuBarExtra.Section title="5h Rate Limit">
          <MenuBarExtra.Item
            title={`${formatPct(rateLimit.used, rateLimit.limit)} used,`}
            icon={KIMI_ICON}
            subtitle={formatResetTime(rateLimit.resetTime)}
          />
        </MenuBarExtra.Section>
      )}

      <MenuBarExtra.Section title="Weekly Quota">
        <MenuBarExtra.Item
          title={`${formatPct(weekly.used, weekly.limit)} used,`}
          icon={KIMI_ICON}
          subtitle={formatResetTime(weekly.resetTime)}
        />
      </MenuBarExtra.Section>

      <MenuBarExtra.Section title="Account">
        <MenuBarExtra.Item
          title={`Plan: ${data.user.membership.level.replace("LEVEL_", "").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}`}
          icon={Icon.Person}
        />
        {data.parallel && (
          <MenuBarExtra.Item
            title={`Parallel: ${data.parallel.limit}`}
            icon={Icon.Layers}
          />
        )}
      </MenuBarExtra.Section>

      <MenuBarExtra.Separator />
      <MenuBarExtra.Item title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
      <MenuBarExtra.Item title="Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
      <MenuBarExtra.Item title="Open Kimi Console" icon={Icon.Link} onAction={() => {
        open("https://www.kimi.com/code/console");
      }} />
    </MenuBarExtra>
  );
}
