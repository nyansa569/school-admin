import React, { JSX } from "react";
import styles from "./Stats.module.css";

// Type definitions
interface TrendData {
  value: number;
  label?: string;
}

interface Badge {
  text: string;
  type: string;
}

interface StatItem {
  id?: string | number;
  label: string;
  value: number | string;
  unit?: string;
  type?: string;
  icon?: string;
  color?: string;
  trend?: TrendData;
  badge?: Badge;
  description?: string;
  secondaryValue?: number | string;
  secondaryLabel?: string;
  progress?: number;
  footer?: string;
}

interface StatsProps {
  stats?: StatItem[];
  variant?: "default" | "compact" | "detailed" | "cards";
  columns?: 2 | 3 | 4 | 6;
  showTrend?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  onStatClick?: (stat: StatItem) => void;
}

const Stats: React.FC<StatsProps> = ({
  stats = [],
  variant = "default",
  columns = 4,
  showTrend = true,
  showIcon = true,
  size = "md",
  onStatClick,
}) => {
  const defaultIcon =
    "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,7H13V13H11V7M11,15H13V17H11V15Z";

  // Trend indicator component
  const TrendIndicator: React.FC<{ trend: TrendData }> = ({ trend }) => {
    if (!trend) return null;

    const isPositive = trend.value > 0;
    const isNeutral = trend.value === 0;

    return (
      <span
        className={`${styles.trend} ${isPositive ? styles.trendUp : isNeutral ? styles.trendNeutral : styles.trendDown}`}
      >
        <svg
          className={styles.trendIcon}
          viewBox="0 0 24 24"
          width="16"
          height="16"
        >
          {isPositive ? (
            <path fill="currentColor" d="M7,15L12,10L17,15H7Z" />
          ) : isNeutral ? (
            <path fill="currentColor" d="M7,13H17V15H7V13Z" />
          ) : (
            <path fill="currentColor" d="M7,10L12,15L17,10H7Z" />
          )}
        </svg>
        <span className={styles.trendValue}>{Math.abs(trend.value)}%</span>
        <span className={styles.trendLabel}>
          {trend.label || "vs last month"}
        </span>
      </span>
    );
  };

  // Icon mapping based on stat type
  const getIcon = (stat: StatItem): JSX.Element => {
    if (stat.icon) return <></>;

    // Default icons based on common school metrics
    const icons: Record<string, string> = {
      students:
        "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z",
      teachers:
        "M20,17A2,2 0 0,0 22,15V4A2,2 0 0,0 20,2H9.46C9.81,2.61 10,3.3 10,4H20V15H11V17M15,7V9H9V22H7V16H5V22H3V14H1.5V9A2,2 0 0,1 3.5,7H15M8,4A2,2 0 0,1 6,6A2,2 0 0,1 4,4A2,2 0 0,1 6,2A2,2 0 0,1 8,4Z",
      classes:
        "M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z",
      parents:
        "M16 4C16 2.89 16.89 2 18 2C19.11 2 20 2.9 20 4C20 5.11 19.11 6 18 6C16.89 6 16 5.1 16 4M20 22V16H22.5L20 8.4C19.7 7.6 19 7 18.1 7H17.9C17 7 16.3 7.6 16 8.4L15.2 11C16.3 11.6 17.1 12.7 17.1 14H15.1C15.1 13.2 14.2 12.3 13.1 12.1L9.8 13.1C8.7 13.4 8 14.5 8 15.6V22H6V14.4L3.3 13.2C2.7 13 2.4 12.3 2.6 11.7C2.8 11.1 3.4 10.8 4 11L8 12.5V9C8 8.5 8.3 8 8.8 7.9L13.2 6.3C14.2 6 15.3 6.4 15.9 7.3L17.9 10.5C18.2 11.1 18.9 11.5 19.7 11.5H22V22H20M11.5 20V14.3L13.7 13.5C14 14.5 14.6 15.4 15.4 16.1L14.1 17.5C13.1 16.7 11.9 16 11.5 16.5C11.2 16.9 12.1 18.1 13 19L11.5 20Z",
      revenue:
        "M11.5 1L15.5 6L12 7.5L13 10.5L17 9L20.5 11.5L17 14L13 12.5L12 15.5L15.5 17L11.5 22L7.5 17L11 15.5L10 12.5L6 14L2.5 11.5L6 9L10 10.5L11 7.5L7.5 6L11.5 1Z",
      attendance:
        "M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12C4 11.71 4 11.42 4.05 11.14C6.73 10.09 9.95 10 12.11 10.93C13.64 10.43 15.35 10.5 16.83 11.11C17.28 11.29 17.69 11.5 18.08 11.79C18.29 12.89 18.33 14.03 18.07 15.18C17.81 16.33 17.36 17.39 16.78 18.35C15.45 19.39 13.77 20 12 20M16.5 9.5C16.5 10.33 15.83 11 15 11C14.17 11 13.5 10.33 13.5 9.5C13.5 8.67 14.17 8 15 8C15.83 8 16.5 8.67 16.5 9.5M8 11C7.17 11 6.5 10.33 6.5 9.5C6.5 8.67 7.17 8 8 8C8.83 8 9.5 8.67 9.5 9.5C9.5 10.33 8.83 11 8 11Z",
      events:
        "M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4M19 20H5V10H19V20M19 8H5V6H19V8M12 13H17V18H12V13Z",
    };

    const iconPath =
      icons[stat.label?.toLowerCase() ?? ""] ||
      icons[stat.type?.toLowerCase() ?? ""] ||
      defaultIcon;

    return (
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d={iconPath} />
      </svg>
    );
  };

  const getSizeClass = (): string => {
    switch (size) {
      case "sm":
        return styles.sm;
      case "lg":
        return styles.lg;
      default:
        return styles.md;
    }
  };

  const getVariantClass = (): string => {
    switch (variant) {
      case "compact":
        return styles.compact;
      case "detailed":
        return styles.detailed;
      case "cards":
        return styles.cards;
      default:
        return styles.default;
    }
  };

  return (
    <div className={`${styles.statsContainer} ${getVariantClass()}`}>
      <div
        className={styles.statsGrid}
        style={{
          ["--columns" as any]: columns,
          ["--columns-mobile" as any]: Math.min(2, columns),
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={stat.id || index}
            className={`${styles.statCard} ${getSizeClass()} ${stat.color ? styles[stat.color] : ""} ${onStatClick ? styles.clickable : ""}`}
            onClick={() => onStatClick && onStatClick(stat)}
          >
            <div className={styles.statContent}>
              {/* Icon Section */}
              {showIcon && (
                <div className={styles.iconWrapper}>
                  {typeof stat.icon === "string" ? (
                    <img src={stat.icon} alt="" className={styles.customIcon} />
                  ) : (
                    <div className={styles.statIcon}>{getIcon(stat)}</div>
                  )}
                </div>
              )}

              {/* Main Stats Section */}
              <div className={styles.statInfo}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>{stat.label}</span>
                  {stat.badge && (
                    <span
                      className={`${styles.badge} ${styles[stat.badge.type]}`}
                    >
                      {stat.badge.text}
                    </span>
                  )}
                </div>

                <div className={styles.statValue}>
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                  {stat.unit && (
                    <span className={styles.statUnit}>{stat.unit}</span>
                  )}
                </div>

                {/* Detailed View Extra Info */}
                {variant === "detailed" && stat.description && (
                  <p className={styles.statDescription}>{stat.description}</p>
                )}

                {/* Trend Indicator */}
                {showTrend && stat.trend && (
                  <TrendIndicator trend={stat.trend} />
                )}
              </div>

              {/* Compact View Side Value */}
              {variant === "compact" && stat.secondaryValue && (
                <div className={styles.compactSecondary}>
                  <span className={styles.secondaryLabel}>
                    {stat.secondaryLabel}
                  </span>
                  <span className={styles.secondaryValue}>
                    {stat.secondaryValue}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar (if provided) */}
            {stat.progress !== undefined && (
              <div className={styles.progressContainer}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${Math.min(100, Math.max(0, stat.progress))}%`,
                  }}
                />
              </div>
            )}

            {/* Footer for Cards Variant */}
            {variant === "cards" && stat.footer && (
              <div className={styles.statFooter}>
                <span>{stat.footer}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
