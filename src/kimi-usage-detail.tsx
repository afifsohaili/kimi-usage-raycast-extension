import { List, ActionPanel, Action, getPreferenceValues, Icon, Color } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import {
  KimiUsageResponse,
  getRateLimitWindow,
  getWeeklyUsage,
  formatResetTime,
  getMembershipName,
} from "./types";

interface Preferences {
  apiKey: string;
  baseUrl: string;
}

function getUsageColor(used: number, limit: number): Color {
  if (limit <= 0) return Color.PrimaryText;
  const pct = used / limit;
  if (pct >= 0.9) return Color.Red;
  if (pct >= 0.7) return Color.Orange;
  if (pct >= 0.5) return Color.Yellow;
  return Color.Green;
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

  if (isLoading && !data) {
    return <List isLoading />;
  }

  if (!data) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.ExclamationMark}
          title="Failed to load usage"
          description="Check your API key in preferences"
        />
      </List>
    );
  }

  const weekly = getWeeklyUsage(data);
  const rateLimit = getRateLimitWindow(data);
  const weeklyPct = weekly.limit > 0 ? Math.round((weekly.used / weekly.limit) * 100) : 0;
  const weeklyColor = getUsageColor(weekly.used, weekly.limit);

  return (
    <List isLoading={isLoading}>
      <List.Section title="Weekly Quota">
        <List.Item
          icon={{ source: Icon.Bolt, tintColor: weeklyColor }}
          title={`${weekly.used} / ${weekly.limit}`}
          subtitle={`${weeklyPct}% used`}
          accessories={[
            { text: `Resets ${formatResetTime(weekly.resetTime)}` },
            { text: `${weekly.remaining} remaining`, icon: Icon.Checkmark },
          ]}
          actions={
            <ActionPanel>
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
            </ActionPanel>
          }
        />
      </List.Section>

      {rateLimit && (
        <List.Section title="5h Rate Limit">
          <List.Item
            icon={{
              source: Icon.Clock,
              tintColor: getUsageColor(rateLimit.used, rateLimit.limit),
            }}
            title={`${rateLimit.used} / ${rateLimit.limit}`}
            subtitle={`${rateLimit.limit > 0 ? Math.round((rateLimit.used / rateLimit.limit) * 100) : 0}% used`}
            accessories={[
              { text: `Resets ${formatResetTime(rateLimit.resetTime)}` },
              { text: `${rateLimit.remaining} remaining`, icon: Icon.Checkmark },
            ]}
            actions={
              <ActionPanel>
                <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={revalidate} />
              </ActionPanel>
            }
          />
        </List.Section>
      )}

      <List.Section title="Account">
        <List.Item
          icon={Icon.Person}
          title="Membership"
          subtitle={getMembershipName(data.user.membership.level)}
        />
        <List.Item
          icon={Icon.Layers}
          title="Parallel Limit"
          subtitle={data.parallel?.limit || "N/A"}
        />
        <List.Item
          icon={Icon.Key}
          title="Auth Method"
          subtitle={data.authentication.method.replace("METHOD_", "")}
        />
      </List.Section>
    </List>
  );
}
